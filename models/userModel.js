const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')


const userSchema =new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    picture:{
        type:String,    // link to the pic is given so the type is string
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
        
    }
},
    {timestamps:true}
)


// Signup Method
userSchema.statics.register = async function(username,email,password,picture){

    if(!email || !password || !username)
        throw Error('All fields must be filled') //By using throw Error() you can propagate the error to higher levels of the code where it can be caught and handled appropriately using try-catch blocks or other error handling mechanisms.

    if(!validator.isEmail(email))
        throw Error('Please enter a valid email')

    if(!validator.isStrongPassword(password))
        throw Error('Passwords should be atleast 8 characters long with atleast 1 uppercase letter, 1 lowercase letter and 1 special character')

    const emailExists = await this.findOne({email})   // check id email already exists  
    // can't use the model name as it is given later so 'this' is used

    if(emailExists)
        throw Error('Email already exists')

    const salt =await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const user = await this.create({email:email,username:username,password:hashedPassword,picture:picture})

    return user
}



// Login method
userSchema.statics.login = async function(username,password){

    if(!password || !username)
        throw Error('All fields must be filled') //By using throw Error() you can propagate the error to higher levels of the code where it can be caught and handled appropriately using try-catch blocks or other error handling mechanisms.

    const user = await this.findOne({username})   // check id email already exists  
    // can't use the model name as it is given later so 'this' is used

    if(!user)
        throw Error('Invalid Credentials')

    const compare =await bcrypt.compare(password,user.password)

    if(!compare)
        throw Error('Invalid Credentials')
    
    return user
}

module.exports = mongoose.model('User',userSchema)


