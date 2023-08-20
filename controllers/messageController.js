const Message = require('../models/messageModel')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')


const allMessages = async (req,res) =>{
    try {
        const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "username picture email")
        .populate("chat");
        // console.log(req.params);

        res.status(200).send(messages);
    } catch (error) {
        res.status(400).send(error.message);
    }
}


const sendMessage = async (req,res) =>{

    const {content,chatId} = req.body

    if(!content || !chatId){
        console.log("Invalid data passed into request");
        return res.sendStatus(400)
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);
    
        // message = await message.populate("sender", "username picture");
        // message = await message.populate("chat");
        // message = await User.populate(message, {
        //   path: "chat.users",
        //   select: "username picture email",
        // });

        message = await (
            await message.populate("sender", "username picture")
          ).populate({
            path: "chat",
            select: "chatName isGroupChat users",
            model: "Chat",
            populate: { path: "users", select: "username email picture", model: "User" },
          });
          
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    
        res.status(200).send(message);

      } catch (error) {
        res.status(400).send(error.message);
      }
}


module.exports = {allMessages,sendMessage}