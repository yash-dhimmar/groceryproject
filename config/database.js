const mysql = require('mysql2');
let db;
class Database {
   connectDb() {
        try {
              db = mysql.createConnection({
              host: 'localhost',
              user: 'root',
              database: 'yash_project',
              password: 'yash123',
            
            })

             db.on('error', function (error) {
                if (error) throw error;
            });
            db.on('connect',()=>{
                console.log('database connected');
        })
            return db.promise();
        } catch (error) {
            console.log("error====>",error)
        }
    }
}
module.exports= new Database();













// const mysql = require('mysql');

// class Database {


//     connect(server) {
//         try {
//            var db = mysql.createConnection({
//                 host: 'localhost',
//                 user: 'root',
//                 database: 'yashdhimmar',
//                 password: 'tristate@123',
                
//             })

//             db.connect(function (err,result) {
//                 if (err) {
//                     console.error('error connecting: ' + err);
//                     if (err) throw err;
//                 }else{
//                 console.log("connected successfully")
//                 }
//                 server.listen(5555,()=>{
//                     console.log("server is listening on the port 5555")
//                 })
                
//             });

//             return db;
            
//         } catch (error) {

//             return (error)
//         }
//     }


//     // custom(query) {
//     //     return new Promise((resolve, reject) => {
//     //       // console.log(`\nCustom query ->> ${query}`);
    
//     //       db.query(query, (error, results) => {
//     //         if (error) {
//     //           console.log(`\nCustom error ->> ${error}`);
//     //           return reject("SOMETHING_WENT_WRONG");
//     //         } else {
//     //           return resolve(results);
//     //         }
//     //       });
//     //     });
//     //   }

// }

// module.exports = new Database;