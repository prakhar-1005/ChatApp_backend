const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require("./routes/messageRoutes");
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');

//express app
const app = express();
const httpServer = createServer(app)
app.use(cors())
app.use(express.json()) //used to enable the built-in JSON parsing(i.e. interpreting something in a structured way) middleware in Express
app.use(cookieParser())


// routes
app.use('/api/user',userRoutes);
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)



const io = new Server(httpServer, {
    pingTimeout:60000, 
    cors: {
      origin: ["http://localhost:5173","https://00chit-chat00.netlify.app"]
    }
  });


io.on("connection", (socket) => {

    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData.id);
        // console.log("1",userData);
        // console.log("2",userData.id);
        socket.emit("connected");
    })

    socket.on("join chat" , (roomData)=>{
        socket.join(roomData._id)
        // console.log(roomData._id);
    })

    socket.on("typing", (room)=>socket.in(room).emit("typing"))
    socket.on("stop typing", (room)=>socket.in(room).emit("stop typing"))

    socket.on("new message" , (newMessageReceived)=>{
        var chat = newMessageReceived.chat // checking info about which chatRoom does the new message belong to so that it can be directed to the appropriate chatrooms
        // console.log(newMessageReceived.chat.users);
        if(!chat.users)
            return console.log("chat.users not defined");
        
        chat.users.forEach((user) => {
            if(user._id == newMessageReceived.sender._id) //in a chatroom the message should be received by everyone except the sender
                return; 
        
            socket.in(user._id).emit("message received", newMessageReceived);//.in means "inside that user's room, emit(send) the message"
            // Except for the user who is the sender, everyone else is sent the message  
        });
    })

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData.id);
      });


})


mongoose.connect(process.env.MONGO_URI)  
    .then(()=>{
        // listen for requests
        httpServer.listen(process.env.PORT||4000, ()=>{
            console.log('server is connected to database and listening on port 4000');
        })
    })
    .catch((error)=>{
        console.log(error);
    })

