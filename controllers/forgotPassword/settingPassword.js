const res = require('express/lib/response');
const db = require('../../db');

exports.sendCode = () => {

    const create4DigitCode = () => {
        const code = Math.floor(1000 + Math.random() * 9000);
        return code;
    };

    const info = () => {

        const promiseFunc = (resovle,reject) => {
            
            let userInfo = {

                phone_number : req.body.phone_number,
                is_test : req.body.is_test
            };

            resolve(userInfo);
        }

        return new Promise(promiseFunc);
    }

    const checkUser = (userInfo) => {

        const promiseFunc = (resolve,reject) => {

            let phone_number = userInfo.phone_number;

            let user = db.get('member').find({phone_number:phone_number}).value();

            if (user) {

                resolve(userInfo);

            }else {

                res.status(400).json({ message: "일치하는 회원 정보가 없습니다. " });
            }
        }

        return new Promise(promiseFunc);
    }

    const makeToken = (userInfo) => {

        const promiseFunc = (resolve,reject) => {

            let secretKey = _config.secretKey;

            let insertInfo = {
                email : userInfo.email,
                code : userInfo.is_test == true ? 1234 : create4DigitCode()
            };

            let options = {

                issuer: 'Ably',
                subject: 'userInfo',
                algorithm: 'HS256',
            };

            
            _jwt.sign(insertInfo, secretKey, options, function (err, token) {
                
                if (err) throw err;

                let sendInfo = {
                    id : userInfo.id,
                    email : userInfo.email,
                    newToken : token
                };
                
                resolve(sendInfo);   
            });

        }

        return new Promise(promiseFunc);
    }


    const sendSms = (sendInfo) => {

        const promiseFunc = (resolve,reject) => {
            
                    
            axios.post('api/send',()=>{
        
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


    const sendCodeFn = () => {

        try {
            const user_info = await info();
            await checkUser(user_info);
            await makeToken(user_info);
            if(user_info.is_test){
                await sendSms(user_info);
            }
            await send_result(user_info);

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
        
        let secretKey = config.secretKey;

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

    //폰넘버만 넘겨서 프론트에 박제

    const send_info = (decoded) => {
        //id,이메일주소 넘겨서 앞에서 수정할 수 있게 해준다.
        const promiseFunc = (resolve,reject) => {

            res.sendStatus(200).json({userInfo : decoded});

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

exports.setNewPassword = () => {

    const info = () => {

        const promiseFunc  = (resolve,reject) => {

            let userInfo = {
                
                id : req.body.member_id,
                new_password : req.body.new_password
            };

            resolve(userInfo);
        }

        return new Promise(promiseFunc);
    }

    const createPassword = (userInfo) => {

        const promiseFunc = (resolve,reject) => {

            _crypto.randomBytes(64,(err,pwd) => {

                const salt = pwd.toString('base64');

                _crypto.pbkdf2(userInfo.new_password,salt,97362,64,'sha512',(err,key) => {
                    
                    const password = key.toString('base64');

                    uerInfo.salt = salt;

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

                res.status(200).json({message : "비밀번호가 재 설정되었습니다."});
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