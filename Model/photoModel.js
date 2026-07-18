const express = require("express");
const mongoose=require("mongoose")

let photoSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,    
        ref:"users",
        required:true
    },
    url:{
        type:String,    
        required:true
    }
},{timestamps:true}
)   
let photoModel=mongoose.model("Photo",photoSchema)

module.exports=photoModel