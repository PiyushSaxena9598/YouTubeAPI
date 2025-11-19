const express=require('express');
const app=express();
const mongoose=require('mongoose');
const userRoute=require('../API/routs/user');
const videoRoute=require('../API/routs/video');
const commentRoute=require('../API/routs/comment')
const bodyParser=require('body-parser');
const fileUpload=require('express-fileupload');
const cors=require('cors')

require('dotenv').config();


// app.get('/test',(req,res)=>{
//     res.status(200).json({message:'API is working fine'});
// });

const connetWithDB=async()=>{
    try{
        const res=await mongoose.connect(process.env.MONGO_URI);          
        console.log('Connected to MongoDB');
    }       
    catch(err){
        console.log('Error connecting to MongoDB:', err);
    }
};
connetWithDB();
app.use(cors())
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:'/tmp/'
}));
app.use('/user',userRoute);
app.use('/video',videoRoute);
app.use('/comment', commentRoute);


module.exports=app;