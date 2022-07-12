const db = require('../../db');

exports.login = (req,res) => {

    const _crypto = require('crypto');

    const info = () => {

        const promiseFunc = (resolve,reject) => {

            let userInfo = {

                email : req.body.email,
                password : req.body.password
            };
            
            resolve(userInfo);
        }

        return new Promise(promiseFunc);
    }

    const checkUser = (userInfo) => {

        const  promiseFunc = (resolve,reject) => {

            let result = db.get('member').find({email:userInfo.email}).value();


            if(result){
                
                _crypto.pbkdf2(userInfo.password,result.salt,97362,64,'sha512',(err,key)=>{

            
                    if(key.toString('base64') === result.password ){
                        
                        res.status(200).json({message :"로그인이 완료되었습니다." ,data : result});

                    }else {

                        res.status(400).json({message : "비밀번호가 틀립니다."});
                    }
                });
            }else {

                res.status(400).json({message : "존재 하지않는 이메일주소입니다."});
            }
        }

        return new Promise(promiseFunc);
    };


    const userLogin = async() => {

        try {
            const user_info = await info();
            await checkUser(user_info);
        } catch (err) {
            console.log(err);
        }
    }

    userLogin();
}