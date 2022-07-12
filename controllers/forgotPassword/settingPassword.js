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

            db.get('memebr')
            .find({phone_number : userInfo.phone_number})
            .value()
            .then((rows) => {
                if(rows){

                    resolve(userInfo);

                }else {

                    res.status(400).json({message : "가입이력이 없는 전화번호입니다.다시 확인 해 주세요"});
                }
            });
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
                    email : userInfo.phone_number,
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
                //성공응답시

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
            
            //프론트에 인증번호 입력 후 확인버튼에 위의 url 주소넣어주기 //3분이지나면 비활성화시킨다.
            res.status(200).json({token : token});
    
        }

        return new Promise(promiseFunc);
    }


    const sendCodeFn = () => {

        try {
            const user_info = await info();
            await checkUser(user_info);

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

        const promiseFunc = (resolve,reject) => {

            res.sendStatus(200).json({id : decoded.phone_number });

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
                
                phone_number : req.body.phone_number,
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
                    
                    resolve();
                });
            });
        }

        return new Promise(promiseFunc);
    };


    const updateUser = () => {

        const promiseFunc = (resolve,reject) => {

            db.get('member')
            .find({phone_number:userInfo.phone_number})
            .assign({password : userInfo.password, salt : userInfo.salt})
            .write()
            .then(()=>{

                res.sendStatus(200).json({message:"비밀번호 변경이 완료되었습니다.다시 로그인 해 주세요"});
            })
        }

        return new Promise(promiseFunc);
        
    };

    
    
}