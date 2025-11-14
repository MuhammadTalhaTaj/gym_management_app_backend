import mongoose from "mongoose";
const enquirySchema = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    contact:{
        type:String,
        required: true
    },
    remark:{
        type:String,
        desfault: ""
    },
    followUp:{
        type: Date,
        required:true
    },
    category:{
        type:String,
        enum:["discussion", "payment", "complaint","other"],
        default: "discussion"
    },
    status:{
        type:String,
        enum:["open", "closed"],
        default: "open",
  },
},{timestamps:true})
export const Enquiry= mongoose.model('Enquiry', enquirySchema);