const jwt=require('jsonwebtoken');



module.exports= async(req, res, next)=>{
    try{
        const token=req.headers.authorization.split(" ")[1];
        await jwt.verify(token,'Piyush Saxena Secret Key');
        next();
    }
    catch(err){
        console.log("Auth Error:", err);
        return res.status(500).json({message:'Auth failed'});
    }
};