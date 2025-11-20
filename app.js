const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoute = require('./routs/user');
const videoRoute = require('./routs/video');
const commentRoute = require('./routs/comment');
const fileUpload = require('express-fileupload');
const cors = require('cors');
require('dotenv').config();

// DB Connect
const connectWithDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.log('Error connecting to MongoDB:', err);
    }
};
connectWithDB();

// Middlewares
app.use(cors());
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Routes
app.use('/user', userRoute);
app.use('/video', videoRoute);
app.use('/comment', commentRoute);

module.exports = app;
