const admin = require('firebase-admin');
const serviceAccount =require('../firebase.json')
const notificationModel=require('../models/notificationModel')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const notification = async (title, body,deviceToken)=>{
  try {
    const message = {
        notification: {
          title: title,
          body: body
        },
        token:deviceToken
      };

      // if(userId!==''){
      //   const newUser = new notificationModel({
      //       userId,
      //       body,
      //       title,
      //   });
      //   await newUser.save();
      // }
      
      await admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  } catch (e) {
    return e.message
  }
};

// const getNotification=async(req,res)=>{
//   try{
//     const result=await notificationModel.find({userId:req.params.id})
//     res.json({
//       status:200,
//       msg:"Get all notification",
//       data:result
//     })
//   }catch(error){
//     res.status(500).json({
//       status: 500,
//       error: error.message
//     });
//   }
// }

module.exports={notification}