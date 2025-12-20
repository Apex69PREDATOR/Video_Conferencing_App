import mongoose, { Schema} from "mongoose";

const userSchema = new Schema({ 
    name : {type:String,required:true},
    username : {type:String,required:true,unique:true},
    email : {type:String,required:true,unique:true},
    password : {type:String,required:true},
});

const userModel = mongoose.model('users',userSchema)

export  {userModel}