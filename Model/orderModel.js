

const mongoose = require('mongoose');



const ordersSchema= new mongoose.Schema({

   customer:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users",
    required:true
   },
  
   
    products:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        discount:{
            type:Number,
        },
        discounted_price:{
            type:Number,
        },
        offer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"offer"
        },
        image:{
            type:String,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
    }],
   
    total:{
        type:Number,
        required:true
    },
    paymentID:{
        type:String,
        required:true
    },
    coupon:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coupon"
        
    },
    final_price:{
        type:Number,
        required:true
    },
    // changes: ensure default is one of the enum values
   orderStatus:{
    type:String,
    enum:["order placed","preparing order", "order shipped", "refund pending",
        "refunded", "order delivered", "order cancelled"],
    default:"order placed"

   },

   // To track the history of order statuses
   historyStatuses: {
    type: [String],
    default: []
   },


   cancelledBy: {
    type: String,
    enum: ["customer", "admin"],
   },

   cancelReason: {
    type: String
   },

   cancelledAt: {
    type: Date
   },

   refundId: {
    type: String
   },

   refundAmount: {
    type: Number
   },

   cancellationFee: {
    type: Number,
    default: 0
   },
   shippingAddress: {
      label: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: Number, required: true },
      country: { type: String, required: true }
   }
    
},
{
    timestamps:true
}  
 )


const ordersModel = mongoose.model("orders",ordersSchema)
module.exports = ordersModel  
