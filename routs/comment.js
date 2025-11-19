const express = require("express");
const Router = express.Router();
const Comment = require("../models/Comment");
const checkAuth = require("../middleware/checkAuth");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

Router.post("/new-comment/:videoId", checkAuth, async (req, res) => {
  try {
    const verifiedUser = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Piyush Saxena Secret Key"
    );
    console.log(verifiedUser);
    const newComment=new Comment({
        _id:new mongoose.Types.ObjectId,
        videoId:req.params.videoId,
        user_id:verifiedUser._id,
        commentText:req.body.commentText
    })
    const comment=newComment.save();
    res.status(200).json({
        newComment:comment 
    })

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});


Router.get('/:videoId', async(req, res)=>{
    try{
        const comments=await Comment.find({videoId:req.params.videoId}).populate('user_id', 'channelName logoUrl')
        res.status(200).json({
            commentList:comments
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

// Update comments

Router.put('/:commentId', checkAuth, async(req, res)=>{
  try{
    const verifiedUser = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Piyush Saxena Secret Key"
    );
    console.log(verifiedUser);
    const comment=await Comment.findById(req.params.commentId);
    console.log(comment);
    if(comment.user_id != verifiedUser._id)
    {
      return res.status(500).json({
        error:'invalid user'
      })
    }
    comment.commentText = req.body.commentText;
    const updatedComment = await comment.save(); 
    res.status(200).json({
      updatedComment:updatedComment 
    })
  } catch(err)
  {
    console.log(err)
    res.status(500).json({
      error:err
    })
  }
})

// Delete Comment

Router.delete('/:commentId', checkAuth, async(req, res)=>{
  try{
    const verifiedUser = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Piyush Saxena Secret Key"
    );
    console.log(verifiedUser);
    const comment=await Comment.findById(req.params.commentId);
    console.log(comment);
    if(comment.user_id != verifiedUser._id)
    {
      return res.status(500).json({
        error:'invalid user'
      })
    }
    await Comment.findById(req.params.commentId);
    res.status(200).json({
      deletedData:"deleted successfully" 
    })
  } catch(err)
  {
    console.log(err)
    res.status(500).json({
      error:err
    })
  }
})



module.exports = Router;
