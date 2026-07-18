const offerModel = require("../../Model/offerModel");
const mongoose = require('mongoose');

async function getOffers(req,res){
    try{

        let offers = await offerModel.find();

        if(!offers){
            return res.status(400).json({
                message:"Could not fetch offers"
            })

        }
        res.status(200).json({
            message:"Offers fetched successfully",
            count: offers.length,
            data: offers
        })



    }
    catch(err){
       res.status(500).json({
        message:"Internal Server Error",
        error:err.message
       })
    
    
    }

}
async function setOffer(req,res){
    try{

        let body = req.body;

        if(!body.title || !body.code || !body.description){
            return res.status(400).json({
                message:"Title, code, and description are required"
            })
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one offer image is required." });
        }

        const imagePaths = req.files.map(file => `${req.protocol}://${req.get('host')}/${file.path}`);

        const offerData = {
            ...body,
            user: req.userId, // From isAdmin middleware
            image: imagePaths
        };

        let offer = await offerModel.create(offerData);

        res.status(201).json({
            message:"Offer created successfully",
            data: offer
        })

    

    }
    catch(err){
        if (err.code === 11000) { // Handle duplicate code error
            return res.status(409).json({ message: "An offer with this code already exists." });
        }
        res.status(500).json({
            message:"Internal Server Error",
            error:err.message
        })
    
    }

}

async function deleteOffer(req,res){
    try{

        let id = req.params.id;

        let offer = await offerModel.findByIdAndDelete(id);

        if(!offer){
            return res.status(404).json({
                message:"Offer not found"
            })
        }
        res.status(200).json({
            message:"Offer deleted successfully",
            data: offer
        })

    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error",
            error:err.message
        })
    }

}

async function updateOffer(req,res){
    try{

        let id = req.params.id;
        let body = req.body;
        
        if (req.files && req.files.length > 0) {
            body.image = req.files.map(file => `${req.protocol}://${req.get('host')}/${file.path}`);
        }

        let offer = await offerModel.findByIdAndUpdate(id,body,{new:true,runValidators:true});

        if(!offer){
            return res.status(404).json({
                message:"Offer not found"
            })
        
        }

        res.status(200).json({
            message:"Offer updated successfully",
            data: offer
        })

    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error",
            error:err.message
        })
    
    }
}

async function updateStatus(req,res){
    try{
        let id = req.params.id;
        let status = req.body.status;

        let updatedStatus = await offerModel.findByIdAndUpdate(id,{status},{new:true});

        if(!updatedStatus){
            return res.status(404).json({
                message:"Offer not found"
            })
        }

        res.status(200).json({
            message:"Status updated successfully",
            data: updatedStatus
        })

    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error",
            error:err.message
        })
    }
}

// async function applyOffer(req,res){
//     try{
//         let {offerCode,productId} = req.body;

//         if(!offerCode || !productId){
//             return res.status(400).json({
//                 message:"Offer code and product ID are required"
//             })
//         }

//         let offer = await offerModel.findOne({code:offerCode});

//         if(!offer){
//             return res.status(404).json({
//                 message:"Offer not found"
//             })
//         }

//         let product = await Product.findById(productId);

//         if(!product){
//             return res.status(404).json({
//                 message:"Product not found"
//             })
//         }

module.exports = {getOffers,setOffer,deleteOffer,updateOffer,updateStatus}