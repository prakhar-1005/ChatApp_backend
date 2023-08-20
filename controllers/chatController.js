const Chat = require('../models/chatModel')
const mongoose = require('mongoose')
const User = require('../models/userModel')


// create or fetch a one-on-one chat (not group chat)
const createOrAccessChat = async (req,res) => {
    
    const {userId} = req.body    // data inside 'req.body' will be sent by user
    // this is the userId of the person with whom we are establishing the chat 

    if(!userId){ 
        return res.status(400).send("Error : userId not sent with request")
    }

    var chat = await Chat.find({
        isGroupChat: false,
        $and: [ 
                {users : {$elemMatch: {$eq: req.user._id} }} , // req.user._id is the ID of the current user making the request. This ensures that the chat includes the current user as one of the participants in the users array.

                {users: {$elemMatch : {$eq: userId} }} // userId is the ID of another user, and this condition ensures that the chat also includes this specific user as one of the participants in the users array.
              ]
        // we basically find a users array where both user1 and user2 are present and populate the chat array and if it is not present then we create them 
    })
    .populate("users", "-password")  // chat array is populated with the data of the users array as well as the latest message also
    .populate("latestMessage")

    // console.log("this is chat : ",chat);
    // console.log("this is datatype of chat : " , typeof(chat));
    // console.log("checking if chat is an arrray : ", Array.isArray(chat));

    chat = await User.populate(chat, {
        path: "latestMessage",
        select: "username picture email"
    })

    if(chat.length>0){  // this is an array so we check its length
        res.send(chat[0])  // there can only be 1 such element where both the users are there and it is present at the 0th index
    }
    else{
        var chatData = {
            chatName: "sender" ,
            isGroupChat:false,
            users:[req.user._id,userId]
        }
        
        try {
            const createdChat = await Chat.create(chatData)
            const fullChat = await Chat.findOne({_id: createdChat._id}).populate("users", "-password")

            res.status(200).send(fullChat)

        } catch (error) {
            res.status(400).send(error.message)
        }
    }

}


// fetch all the chats for the user
const fetchChats =async (req,res)=>{
    try {
        Chat.find({users:{ $elemMatch:{$eq: req.user._id} } })  // $elemMatch in mongoDB is used for matching elements in an array
        .populate("users", "-password")   // it means populate the users "field" with all the data of the user from the "users" collection except for password
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt: -1})  // sorting from the newest to oldest
        .then(async (results) =>{
            // console.log("this is result before populate", results) //--> contains the entry in the mongoDB database that matches the find() query
            
            results =await User.populate(results,{  // to further populate the latestMessage.sender field in the fetched chat documents with the data from the "User" model 
                path: "latestMessage.sender",
                select: "username picture email"
            })
            // console.log("this is result after populate", results)
            res.status(200).send(results)
        })
    
    } catch (error) {
        res.status(400).send(error.message)
    }
}


// create group chat
const createGroup = async (req,res) =>{
    // here we take multiple users in form of array from the body of request who are to be included in the group along with the name of the group
    
    if(!req.body.users || !req.body.name){
        return res.status(400).send("Please fill all the fields")
    }

    var usersInTheGroup = JSON.parse(req.body.users)  // this is done because in the frontend we can't send the users to be added in the form of an array to the backend, we need to send it as a json string, so in the backend we first parse the json string to an object

    if(usersInTheGroup.length<2){
        return res.status(400).send("Add at least 2 users to the group")
    }

    usersInTheGroup.push(req.user)  // the person creating the group must also be in the group apart from atleast 2 other users

    try {        
        const group = await Chat.create({
            chatName: req.body.name,
            isGroupChat:true,
            users: usersInTheGroup,
            groupAdmin: req.user,
        })
        // console.log("this is group",group)

        const fullGroup = await Chat.findOne({_id: group._id})
            .populate("users","-password")
            .populate("groupAdmin","-password")

        // console.log("this is fullGroup",fullGroup)
        res.status(200).send(fullGroup)
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message)
    }
}

// Used for renaming an existing group
const renameGroup = async (req,res)=>{

    if(!req.body.name || !req.body.groupId ){
        return res.status(400).send("Please enter the details")
    }

    try {
        const updatedChat =await Chat.findByIdAndUpdate(req.body.groupId,
            {chatName: req.body.name},
            {new:true} )  // new: true is written so that the findByIdAndUpdate returns the updated document after the update

        // console.log("This is updatedChat before populate",updatedChat);
            .populate("users","-password")
            .populate("groupAdmin", "-password")
        console.log("This is updatedChat after populate",updatedChat);
        res.status(200).send("Group name changed successfully")
    } catch (error) {
        res.status(400).send("Error occured while changing the group name")
    }
}


// used for adding a user to an existing group
const addToGroup = async (req,res) =>{

    const {userId, groupId} = req.body

    if(!userId){
        return res.status(400).send("Select a user to be added")
    }

    if(!groupId){
        return res.status(400).send("Select a group first")
    }

    try {
        const updatedGroupMembers = await Chat.findByIdAndUpdate(groupId , {$push : {users: userId} }, {new:true})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        res.status(200).send("User added successfully")

    } catch (error) {
        res.status(400).send("Error occured while adding the user to the group")
    }
}


// used for removing a user from an existing group
const removeFromGroup = async (req,res) =>{
    const {userId, groupId} = req.body

    if(!userId){
        return res.status(400).send("Select a user to be removed")
    }

    if(!groupId){
        return res.status(400).send("Select a group first")
    }

    try {
        const updatedGroupMembers = await Chat.findByIdAndUpdate(groupId , {$pull : {users: userId} }, {new:true})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        res.status(200).send("User removed successfully")
    } catch (error) {
        res.status(400).send("Error occured while removing the user from the group")
    }
}


module.exports = {createOrAccessChat,fetchChats,createGroup,renameGroup,addToGroup,removeFromGroup}