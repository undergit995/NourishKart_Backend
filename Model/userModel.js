const express = require('express');
const mongoose = require('mongoose');



const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        RegExp:/^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password:{
        type:String,
        required:true,
        RegExp:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        
    },
    phone:{
        type:Number,
        required:true
    
    },
    role:{
        type:String,
        default:"customer",
        enum:["customer","admin"]
    },
    image:{
        type:String,
        defaulr:""
    },
  
   
},
{
    timestamps:true
}  
 )


const userModel = mongoose.model("users",userSchema)
module.exports = userModel  
