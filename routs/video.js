const express = require("express");
const Router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const jwt = require("jsonwebtoken");
const Video = require("../models/Video");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

Router.post("/upload", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = await jwt.verify(token, "Piyush Saxena Secret Key");
    const uploadedVideo = await cloudinary.uploader.upload(
      req.files.video.tempFilePath,
      {
        resource_type: "video",
      }
    );
    const uploadedThumbnail = await cloudinary.uploader.upload(
      req.files.thumbnail.tempFilePath
    );

    const newVideo = new Video({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      description: req.body.description,
      user_id: user._id,
      thumbnailUrl: uploadedThumbnail.secure_url,
      thumbnailId: uploadedThumbnail.public_id,
      videoUrl: uploadedVideo.secure_url,
      videoId: uploadedVideo.public_id,
      catogory: req.body.catogory,
      tags: req.body.tags.split(","),
    });
    const newUploadedVideo = await newVideo.save();
    res.status(200).json({ newVideo: newUploadedVideo });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Updating Video Details

Router.put("/:videoId", checkAuth, async (req, res) => {
  try {
    const verifiedUser = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Piyush Saxena Secret Key"
    );
    const video = await Video.findById(req.params.videoId);

    if (video.user_id == verifiedUser._id) {
      if (req.files) {
        await cloudinary.uploader.destroy(video.thumbnailId);
        const updatedThumbnail = await cloudinary.uploader.upload(
          req.files.thumbnail.tempFilePath
        );
        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          catogory: req.body.catogory,
          tags: req.body.tags.split(","),
          thumbnailUrl: updatedThumbnail.secure_url,
          thumbnailId: updatedThumbnail.public_id,
        };
        const updatedVideoDetail = await Video.findByIdAndUpdate(
          req.params.videoId,
          updatedData,
          { new: true }
        );
        res.status(200).json({ updatedVideo: updatedVideoDetail });
      } else {
        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          catogory: req.body.catogory,
          tags: req.body.tags.split(","),
        };
        const updatedVideoDetail = await Video.findByIdAndUpdate(
          req.params.videoId,
          updatedData,
          { new: true }
        );
        res.status(200).json({ updatedVideo: updatedVideoDetail });
      }
    } else {
      return res
        .status(500)
        .json({ message: "You are not authorized to update this video." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Deleting

Router.delete("/:videoId", checkAuth, async (req, res) => {
  try {
    const verifiedUser = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Piyush Saxena Secret Key"
    );
    //console.log(verifiedUser);
    const video = await Video.findById(req.params.videoId);
    if (video.user_id == verifiedUser._id) {
      await cloudinary.uploader.destroy(video.videoId, {
        resource_type: "video",
      });
      await cloudinary.uploader.destroy(video.thumbnailId);
      await Video.findByIdAndDelete(req.params.videoId);
      res.status(200).json({ message: "Video deleted successfully." });
    } else {
      return res
        .status(500)
        .json({ message: "You are not authorized to delete this video." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Like and Dislike

Router.put("/like/:videoId", checkAuth, async (req, res) => {
  try {
    const verifiedUser = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Piyush Saxena Secret Key"
    );
    console.log(verifiedUser);
    const video = await Video.findById(req.params.videoId);
    console.log(video);
    if (video.likedBy.includes(verifiedUser._id)) {
      return res
        .status(400)
        .json({ message: "You have already liked this video." });
    }

    if (video.dislikedBy.includes(verifiedUser._id)) {
      video.dislikes -= 1;
      video.dislikedBy = video.dislikedBy.filter(
        (userId) => userId.toString() != verifiedUser._id
      );
    }

    video.likes += 1;
    video.likedBy.push(verifiedUser._id);
    await video.save();
    res.status(200).json({
      message: "Liked",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// dislike route

Router.put("/dislike/:videoId", checkAuth, async (req, res) => {
  try {
    const verifiedUser = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Piyush Saxena Secret Key"
    );
    console.log(verifiedUser);
    const video = await Video.findById(req.params.videoId);
    console.log(video);
    if (video.dislikedBy.includes(verifiedUser._id)) {
      return res
        .status(400)
        .json({ message: "You have already disliked this video." });
    }

    if (video.likedBy.includes(verifiedUser._id)) {
      video.likes -= 1;
      video.likedBy = video.likedBy.filter(
        (userId) => userId.toString() != verifiedUser._id
      );
    }

    video.dislikes += 1;
    video.dislikedBy.push(verifiedUser._id);
    await video.save();
    res.status(200).json({
      message: "disLiked",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Subscribe Route

Router.put("/subscribe/:userBId", checkAuth, async (req, res) => {
  try {
      const userA = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Piyush Saxena Secret Key"
    );
    console.log(userA);
    userB = await User.findById(req.params.userBId);
    console.log(userB);

    if (userB.subscribedBy.includes(userA._id)) {
      return res
        .status(400)
        .json({ message: "You have already subscribed to this channel." });
    }
    userB.subscribers += 1;
    userB.subscribedBy.push(userA._id);
    await userB.save();
    const userAFullInformation = await User.findById(userA._id);
    userAFullInformation.subscribedChannels.push(userB._id);
    await userAFullInformation.save();
    res.status(200).json({ message: "Subscribed successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Unsubscribe 

Router.put("unsubscribe/:userBId", checkAuth, async (req, res)=>{
  try{
    const userA = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Piyush Saxena Secret Key"
    );
    const userB = await User.findById(req.params.userBId)
    if (userB.subscribedBy.includes(userA._id)) {
      userB.subscribers -= 1;
      userB.subscribedBy = userB.subscribedBy.filter(userId=>userId.toString()!=userA._id)
      await userB.save();
      const userAFullInformation=await User.findById(userA._id)
      userAFullInformation.subscribedChannels=userAFullInformation.subscribedChannels.filter(userId=>userId.toString()!=userB._id)
      await userA.save();
      res.status(200).json({
        message:'Unsubscribed'
      })
    }
    else
    {
      return res
        .status(500)
        .json({ message: "You have not subscribed to this channel." });
    }
  }
  catch(err)
  {
    console.log(err);
  }
})


// Views Api

Router.put('/views/:videoId', async (req, res)=>{
  try
  {
    const video = await Video.findById(req.params.videoId)
    console.log(video)
    video.views += 1;
    await video.save();
    res.status(200).json({
      message:'Liked'
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

module.exports = Router;
