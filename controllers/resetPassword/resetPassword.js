const db = require('../../db');
const _config = require('../../config.json');
const { decode } = require('punycode');

exports.sendCode = (req,res) => {

    const create4DigitCode = () => {
        const code = Math.floor(1000 + Math.random() * 9000);
        return code;
    };

    const info = () => {

        const promiseFunc = (resolve,reject) => {
            
            let enteredInfo = {

                phone_number : req.body.phone_number,
                is_test : req.body.is_test
            };

            resolve(enteredInfo);
        }

        return new Promise(promiseFunc);
    }

    const checkUser = (enteredInfo) => {

        const promiseFunc = (resolve,reject) => {

            let phone_number = enteredInfo.phone_number;

            let userInfo = db.get('member').find({phone_number:phone_number}).value();

            if (userInfo) {
                console.log(enteredInfo)

                resolve(userInfo,enteredInfo);

            }else {

                res.status(400).json({ message: "일치하는 회원 정보가 없습니다. " });
            }
        }

        return new Promise(promiseFunc);
    }

    const makeToken = (userInfo,enteredInfo) => {

        const _jwt = require('jsonwebtoken');

        const promiseFunc = (resolve,reject) => {

            let secretKey = _config.jwtSecretKey;

            let insertInfo = {
                email : userInfo.email,
                id : userInfo.id,
                code : enteredInfo.is_test == true ? 1234 : create4DigitCode()
            };

            let options = {

                issuer: 'Ably',
                subject: 'userInfo',
                algorithm: 'HS256',
            };

            
            _jwt.sign(insertInfo, secretKey, options, function (err, token) {
                
                if (err) throw err;

                //프론트로 보낼 정보
                let sendInfo = {
                    id : userInfo.id,
                    email : userInfo.email,
                    newToken : token,
                    code : insertInfo.code
           
                };
              
                resolve(sendInfo);   
            });

        }

        return new Promise(promiseFunc);
    }


    const sendSms = (sendInfo) => {

        const promiseFunc = (resolve,reject) => {


            axios.post('api/send',()=>{
                //code값 담아서 전송(sendInfo.code)
            })
            .then((res)=>{

                resolve(sendInfo);

            })
            .catch((err)=>{

                res.status(500).json({message : 'err caught In send_sms function'});
            })
            
        }

        return new Promise(promiseFunc);

    }

    const send_result = (sendInfo) => {

        let token = sendInfo.newToken;

        const promiseFunc = (resolve,reject) => {
            
            res.status(200).json({token : token, message : "인증코드가 전송되었습니다."});
    
        }

        return new Promise(promiseFunc);
    }


    const sendCodeFn = async() => {

        try {
            const entered_info = await info();
            const user_info = await checkUser(entered_info);
            const send_info = await makeToken(user_info,entered_info);
            if(!entered_info.is_test){
                await sendSms(send_info);
            }
            await send_result(send_info);

        } catch (err) {
            console.log(err);
        }
    }

    sendCodeFn();
};

exports.checkDigitCode = (req,res) => {
    
    const info = () => {

        const promiseFunc = (resolve,reject) => {

            let token = req.body.token;

            resolve(token);

        }

        return new Promise(promiseFunc);
    }
    
    
    const verifyToken = (token) => {

        const _jwt =require('jsonwebtoken');

        let secretKey = _config.jwtSecretKey;

        const promiseFunc = (resolve,reject) => {

            _jwt.verify(token,secretKey,
    
                function(err,decoded){
    
                    if(err){

                        res.status(500).json({message : 'err caught In verify Token function'});
    
                    }else{
                        
                        resolve(decoded);
                    }    
            });
        }
            
        return new Promise(promiseFunc) ;
    }

    //유효시간 3분은 프론트에서 제어 
    const checkValidate = (decoded) => {

        let digit_code = Number(req.body.digit_code);
        const promiseFunc = (resolve,reject) => {

            if(decoded.code === digit_code){

                resolve(decoded);

            }else{

                res.sendStatus(400).json({message:"인증번호가 다릅니다 다시 입력 해 주세요"});
            }
        }

        return new Promise(promiseFunc);
    }

    const send_info = (decoded) => {

        //frontside에 이메일주소 노출, id값은 비밀번호 수정할때 같이 보내준다.
        const promiseFunc = (resolve,reject) => {

            let sendInfo = {
                email : decoded.email,
                id : decoded.id
            }
            res.status(200).json({userInfo : sendInfo});

        }

        return new Promise(promiseFunc);
    }

    const promise = async() => {

        try {
            const token = await info();
            const decoded = await verifyToken(token);
            await checkValidate(decoded)
            await send_info(decoded);
        } catch (e) {
            
            console.log(e);
        }

    }
    
    promise();
};

exports.setNewPassword = (req,res) => {

    const info = () => {

        const promiseFunc  = (resolve,reject) => {

            let userInfo = {
                
                id : req.body.id,
                password : req.body.password
            };

            resolve(userInfo);
        }

        return new Promise(promiseFunc);
    }

    const createPassword = (userInfo) => {
        
        const _crypto = require('crypto');

        let password = userInfo.password;

        const promiseFunc = (resolve,reject) => {

            _crypto.randomBytes(64,(err,pwd) => {

                const salt = pwd.toString('base64');

                _crypto.pbkdf2(password,salt,97362,64,'sha512',(err,key) => {
                    
                    const password = key.toString('base64');

                    userInfo.salt = salt;

                    userInfo.password = password;
                    
                    resolve(userInfo);
                });
            });
        }

        return new Promise(promiseFunc);
    };


    const updateUser = (userInfo) => {

        const promiseFunc = (resolve,reject) => {

            let result = db.get('member')
            .find({id:userInfo.id})
            .assign({password : userInfo.password, salt : userInfo.salt})
            .write();

            if(result) {

                res.status(201).json({message : "비밀번호가 재설정되었습니다."});
            }else{

                res.status(500).json({message : 'err caught In reset Password function'});
            }

        }

        return new Promise(promiseFunc);
        
    };

    
    const reset  = async() => {

        try {
            const user_info = await info();
            await createPassword(user_info);
            await updateUser(user_info);
            await updateUser(user_info);
        } catch (err) {
            
            console.log(err);
        }
        
    }

    reset();
    
}