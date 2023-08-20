const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const mongoose = require('mongoose')

// Function for generating tokens
const generateToken = (_id)=>{
    return jwt.sign({id:_id}, process.env.JWT_SECRET)
}


//Register the user
const registerUser = async (req,res)=>{
    const {username,email,password,picture} = req.body
    try {
        const user = await User.register(username,email,password,picture)
        const token= generateToken(user._id)
        res.status(201).json({username,email,token,id:user._id,isAdmin:user.isAdmin,picture:user.picture})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}


//Login the user and generate a token 
const loginUser = async (req,res)=>{
    const {username,password} = req.body     // body of the http request, contains data sent by the user
    
    try {  
        const user =await User.login(username,password)
        const token =generateToken(user._id)
        res.status(201).json({username,token,isAdmin:user.isAdmin, email:user.email, picture:user.picture,id:user._id})
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}


// the url will look like  localhost:4000/api/user?search=Alex 
// extracting the query using req.query.search (search is the key and Alex is the value)
const allUsers =async (req,res)=>{
    const keyword  = req.query.search
    let queryResult;
    if(keyword) {
        // an array of expessions(the array can have more than 2 expressions). The $or selects the documents that satisfy at least one of the expressions.
        queryResult={
            $or: [ { username: {$regex: req.query.search , $options: "i"} } , { email: {$regex: req.query.search , $options: "i"} } ]  
        } 
    }   
    else{
        return
    }
    // console.log("query res: ",queryResult);
    // console.log("type of req: ", typeof(req) )
    // console.log("this is request",req.user);
    const users = await User.find(queryResult).find({_id:{$ne: req.user._id}});
    
    res.send(users)

}


module.exports = {loginUser,registerUser,allUsers}