import mongoose, { Schema} from "mongoose";

const meetingSchema = new Schema({ 
    userId : {type:mongoose.Schema.Types.ObjectId,ref:'users',required:true},
    meetingCode : {type:String,required:true,unique:true},
    date : {type:Date,required:true,default:Date.now},
});

const meetingModel = mongoose.model('meetings',meetingSchema)

export  {meetingModel}