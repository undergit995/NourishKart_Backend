const express = require("express");
const mongoose=require("mongoose")
 

let ResetSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    
    }
    
},{timestamps:true}
)
let resetModel=mongoose.model("Reset",ResetSchema)

module.exports=resetModel