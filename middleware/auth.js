const User = require('../models/user')
const UserController = require('../controllers/Usercontroller');
const promise = require('bluebird');
const jwt = require('jsonwebtoken');
const ResponseController = require('../controllers/responseController')
class Auth{
  
  async authenticate(req,res,next){
    try{
        if('authorization' in req.headers && req.headers.authorization != null){
            var token = req.headers.authorization;
            console.log("token============>",token)
            var decodedData = jwt.verify(token, 'secretkey');
            if(decodedData.iat < decodedData.exp){
             next()
            }
        }else{
            throw new Error('Authorization token is missing');
        }  
    }catch (error){
        return ResponseController.error(error,res)
    }
}


}
module.exports =  new Auth();





























// const User=require('../models/user');
// //const promise = require('bluebird');
// const jwt = require('jsonwebtoken');

// const ResponseController = require('../controllers/responseController')
// class Auth{
//     async authenticate(req,res,next){
//         try{
//             if('authorization' in req.headers && req.headers.authorization != null && req.headers.authorization != ''){
//                 let token = req.headers.authorization;
//                 var decoded = jwt.verify(token,'practice',(err,result)=>{
//                     //console.log(result)
//                     if(err) throw err;
//                     return result;
//                 });
                
//                 let decodedUser = decoded.user;
//                 let user = await User.singleUser(decodedUser.id);
//                 req.authUser = user; 
//                 if(!user){
//                     throw Error('your account is deleted by admin');
//                 }
//                 if(user.status == 0){
//                     //console.log('userstatus=====>',user.status)
//                     throw Error('your account is restricted by admin or not active');
//                 }
//                 next();
//             }else{
//                 throw Error('token not found');

//             }
//         }catch(error){
//             return ResponseController.error(error,res);
//         }
//     }
// }
// module.exports =  new Auth();