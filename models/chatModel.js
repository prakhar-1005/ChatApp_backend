const mongoose = require('mongoose')

const chatSchema = mongoose.Schema({

    chatName:{
        type:String,
        trim:true,
    },

    isGroupChat:{
        type:Boolean,
        default:false
    },

    users:[{
        type:mongoose.Schema.Types.ObjectId,   /*used for referencing other documents in a MongoDB database when working with Mongoose*/
        ref:"User"            // We are creating relationships between different collections in mongoDB
    }],

    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,   
        ref:"message"
    },

    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,    // since this is a user so referencing it as the id would be better.
        ref:"User"
    }

}
,{
    timestamps:true 
}
)

module.exports = mongoose.model('Chat',chatSchema)