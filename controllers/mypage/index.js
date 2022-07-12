const db = require('../../db');

exports.getUserInfo = (req,res) => {

    const info = () => {

        const promiseFunc = (resolve,reject) => {

            let member_id = req.params.member_id;
   
            resolve(member_id);
        }

        return new Promise(promiseFunc);
    }


    const getInfo = (member_id) => {

        let id = Number(member_id);

        const promiseFunc = (resolve,reject) => {

            let info = db.get('member')
                        .find({id:id}).value();
            
            if(info){
                console.log("yes")
                resolve(info);
            }
        }

        return new Promise(promiseFunc)
    }

    const send_result = (info) => {

        const promiseFunc = (resolve,reject) => {

            res.status(200).json({information : info});
            
        };

        return new Promise(promiseFunc);
    }
 
    
    const mypage = async() => {

        try {
            const id = await info();
            const memberInfo = await getInfo(id)
            await send_result(memberInfo);
        } catch (err) {
            
            console.log(err);
        }
    }

    mypage();
}