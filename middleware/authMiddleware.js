const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req,res,next)=>{
    const {authorization} = req.headers
    let token;
    if(!authorization){
        return res.status(400).send("Error: Authorization Token Required")
    }
    
    try {
            token = authorization.split(' ')[1];  // separating the token value  the "Bearer" word and assigning it to token
            const data = jwt.verify(token,process.env.JWT_SECRET)

            req.user = await User.findById(data.id).select('-password')

            // console.log("req.headers : ", req.headers);
            // console.log("authorization : ", authorization)
            // console.log("data : ",data );
            // console.log("req.user : ",req.user)

            next()

        } catch (error) {
            return res.status(401).send("Error : Reqeust is not authorized")
        }

}

module.exports = {requireAuth}