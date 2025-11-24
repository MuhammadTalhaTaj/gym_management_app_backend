import mongoose from "mongoose";
const memberSchema = mongoose.Schema({
createdBy:{
    type:mongoose.Types.ObjectId,
    ref: 'Admin',
    required:true
},
createdByStaff:{
type:mongoose.Types.ObjectId,
    ref: 'Staff',
},
status:{
type: String,
default:"active"
},
name:{
    type: String,
    required:true
},
email:{
    type: String,
    required:true
},
contact:{
    type: String,
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
admissionAmount:{
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

gender: {
    type: String,
}

},{timestamps: true})

export const Member = mongoose.model('Member', memberSchema)