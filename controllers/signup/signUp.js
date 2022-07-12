
const config = require('../../config.json');
const db = require('../../db');

exports.sendDigitCode = (req,res) => {

    const create4DigitCode = () => {
        const code = Math.floor(1000 + Math.random() * 9000);
        return code;
    };

    const info = () => {

        const promiseFunc = (resolve,reject) => {

            let userInfo = {

                phone_number : req.body.phone_number,
                is_test : req.body.is_test
            }

            resolve(userInfo);
        }

        return new Promise(promiseFunc);
    }

    const phoneNumCheck = (userInfo) => {

        const promiseFunc = (resolve,reject) => {

            let phone_number = userInfo.phone_number;

            let user = db.get('member').find({phone_number:phone_number}).value();

            if(user) {

                res.status(400).json({ message : '이미 가입된 번호입니다.' });
            }else {

                resolve(userInfo);
            }

        }

        return new Promise(promiseFunc);
    }

    
    const makeToken = (userInfo) => {
        
        const _jwt = require('jsonwebtoken');

        const promiseFunc = (resolve,reject) => {

            let secretKey = config.jwtSecretKey;

            let insertInfo = {
                phone_number : userInfo.phone_number,
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
                    phone_number : insertInfo.phone_number,
                    newToken : token
                };

                resolve(sendInfo);   
            });

        }

        return new Promise(promiseFunc);
    }


    const sendSms = (sendInfo) => {

        const axios = require('axios');

        const promiseFunc = (resolve,reject) => {

        
            axios.post('api/send',()=>{
        
            })
            .then((res)=>{
                //성공응답시

                resolve(sendInfo);

            })
            .catch((err)=>{

                res.status(500).json({message : 'err caught In send_sms function'});
            })
            
        }

        return new Promise(promiseFunc);
        
    }

    //토큰값유알엘보내서 프론트에서입력하는 코드값이랑 같은지 비교하기 
    const send_result = (sendInfo) => {

        let token = sendInfo.newToken;

        const promiseFunc = (resolve,reject) => {
            
            //프론트에 인증번호 입력 후 확인버튼에 위의 url 주소넣어주기
            res.status(200).json({token : token});
    
        }

        return new Promise(promiseFunc);
    }

    const sendCode = async() =>{

        try {
            const user_info = await info();
            await phoneNumCheck(user_info);
            const send_info = await makeToken(user_info);
            if (!user_info.is_test) {
                await sendSms(send_info);
            }
            await send_result(send_info);

        } catch (err) {
            
            console.log(err)
        }
    };

    sendCode();

}

//signup 뷰페이지 , 파람스로 토큰받아오기 
// /signup/:token
exports.checkDigitCode = (req,res) => {
    
    const info = () => {

        const promiseFunc = (resolve,reject) => {

            let token = req.body.token;

            resolve(token);
        }

        return new Promise(promiseFunc);
    }
    
    
    const verifyToken = (token) => {
        
        let secretKey = config.jwtSecretKey;

        const promiseFunc = (resolve,reject) => {

            _jwt.verify(token,secretKey,
    
                function(err,decoded){
    
                    if(err){
                    
                        console.log(err);

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

                resolve();

            }else{

                res.status(400).json({message:"인증번호가 다릅니다 다시 입력 해 주세요"});
            }
        }

        return new Promise(promiseFunc);
    }

    //폰넘버만 넘겨서 프론트에 박제

    const send_info = (decoded) => {

        const promiseFunc = (resolve,reject) => {


            res.status(200).json({phone_number : decoded.phone_number });
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
}

//email중복검사
exports.checkEmail = (req,res) => {

    const init = () => {
        
        const promiseFunc = (resolve,reject) => {
            
            let userInfo = {

                email : req.body.email
            }

            resolve(userInfo);
        }

        return new Promise(promiseFunc);
    };

    const findEmail = (userInfo) => {

        const promiseFunc = (resolve,reject) => {

            let result = db.get('member').find({email:userInfo.email}).value();

            if(result) {

                res.status(400).json({message:"이미 가입된 이메일 주소 입니다."});

            }else{

                res.status(200).json({message:"가입가능한 이메일입니다"});

            }
        }

        return new Promise(promiseFunc);
    };

    const email = async() => {

        try {
            const user_info = await init();
            await findEmail(user_info)
        } catch (err) {
            console.log(err)
        }
    }

    email();
}

//등록페이지
exports.signUp = (req,res) => {

    const info = () => {

        const promiseFunc = (resolve,reject) => {

            let userInfo = {

                email : req.body.email.trim(),
                nickname : req.body.nickname.trim(),
                password : req.body.password.trim(),
                name : req.body.name.trim(),
                phone_number : req.body.phone_number.trim(),

            }

            resolve(userInfo);
        }

        return new Promise(promiseFunc);

    };

    const createUuid = (userInfo) => {

        const _uuid = require('uuid');

        const promiseFunc = (resolve,reject) => {

            userInfo.uuid = _uuid.v4();

            resolve(userInfo);
        }

        return new Promise(promiseFunc);
    };

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
                    
                    resolve();
                });
            });
        }

        return new Promise(promiseFunc);
    };

    const addUser = (userInfo) => {

        const shortId = require('shortid');
        const _dateformat = require('dateformat');

        const promiseFunc = (resolve,reject) => {

            db.get('member')
            .push({
                    id : shortId.generate(),
                    email : userInfo.email,
                    nickname : userInfo.nickname,
                    password : userInfo.password,
                    salt : userInfo.salt,
                    uuid : userInfo.uuid,
                    name : userInfo.name,
                    phone_number : userInfo.phone_number,
                    createdAt : _dateformat(new Date(), 'yyyy-mm-dd')
    
            }).write();
            
            resolve();
        }

        return new Promise(promiseFunc);
        
    };

    const send_result = () => {

        const promiseFunc = (resolve,reject) => {

            res.status(201).json({message:"회원가입이 완료되었습니다."});

        }

        return new Promise(promiseFunc);
    }


    const saveUser = async() => {

        try {
            const user_info = await info();
            await createUuid(user_info);
            await createPassword(user_info);
            await addUser(user_info);
            await send_result();

        } catch (err) {
            
            console.log(err)
        }
    }

    saveUser();
}