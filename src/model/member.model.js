import mongoose from "mongoose";
const memberSchema = mongoose.Schema({
name:{
    type: String,
    required:true
},
email:{
    type: String,
    required:true
},
contact:{
    type: Number,
    required:true
},
batch:{
    type: String,
    enum:["morning", "evening", "afternoon", "night"],
    required:true
},
address:{
    type: String,
 },
plan:{
    type: mongoose.Types.ObjectId,
    ref: 'Plan',
},
joinDate:{
    type: Date,
    required: true
},
admissionFee:{
    type: Number,
    required:true,
    default: 0
},
discount:{
    type: Number,
    
},
collectedAmount:{
    type: Number,
    required: true
},
dueAmount:{
    type: Number,

},

},{timestamps: true})

export const Member = mongoose.model('Member', memberSchema)