const couponModel = require("../../Model/couponModel");


async function setCoupon(req, res) {
    try {

        let body = req.body;
        console.log(body)
        if (!body) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        if (body.starts_At) {
            body.starts_At = new Date(body.starts_At)
        };
        if (body.ends_At){
            body.ends_At = new Date(body.ends_At)
        } 

        if (body.starts_At && body.ends_At && body.ends_At <= body.starts_At) {
            return res.status(400).json({ message: "End date must be after the start date." });
        }

        let coupon = await couponModel.create(body)

        if (!coupon) {
            return res.status(400).json({
                message: "Something went wrong"
            })
        }
        res.status(200).json({
            message: "Coupon created successfully",
            coupon
        })

    }
    catch (err) {
                res.status(500).json({
            message: err.message
        })

    }

}
async function deleteCoupon(req, res) {
    console.log(req.params.id,"delete")
    try{
        let id = req.params.id;
        let coupon = await couponModel.findByIdAndDelete(id);

        if(!coupon){
            return res.status(400).json({
                message:"Coupon not found"
            })
        }
        res.status(200).json({
            message:"Coupon deleted successfully",
            coupon
        })
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

async function updateCoupon(req, res) {
    try{
        let userId = req.userId
        let id = req.params.id;
        let body = req.body;
        if(!body){
            return res.status(400).json({
                message:"All fields are required"
            })
        }
        if(body.starts_At){
            body.starts_At = new Date(body.starts_At)
        }
        if(body.ends_At){
            body.ends_At = new Date(body.ends_At)
        }

        let coupon = await couponModel.findByIdAndUpdate(id,body,{returnDocument:"after",runValidators:true})
        

        if(!coupon){
            return res.status(400).json({
                message:"Coupon not found"
            })
        }

        res.status(200).json({
            message:"Coupon updated successfully",
            coupon
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

async function couponStatus(req,res){
    try{
        let id = req.params.id;
        let status = req.body.status;


        let couponStatus = await couponModel.findById(id);

        if (!couponStatus) {
            return res.status(404).json({
                message:"Coupon not found"
            })
        }

        // New check: Prevent activating a coupon before its start date.
        if (status === 'Active' && new Date() < couponStatus.starts_At) {
            return res.status(400).json({
                message: `Cannot activate this coupon yet. It is scheduled to start on ${couponStatus.starts_At.toLocaleDateString()}.`
            });
        }

        // Prevent activating a coupon that has already expired.
        if (status === 'Active' && couponStatus.ends_At <= new Date()) {
            return res.status(400).json({
                message: "Cannot activate an expired coupon. Please update the end date first."
            });
        }

        // Automatically set to 'inActive' if it's expired, regardless of requested status.
        if (couponStatus.ends_At <= new Date() && couponStatus.status !== 'inActive') {
            couponStatus.status = 'inActive';
            await couponStatus.save();
            return res.status(400).json({
                message: "This coupon has expired and has been automatically set to inactive."
            });
        }

        if(couponStatus.status === status){
            return res.status(400).json({
                message:"Coupon is already in this status"
            })

        }

        let result = await couponModel.findByIdAndUpdate(id,{status},{new:true,runValidators:true})

        if(!result){
            return res.status(400).json({
                message:"Something went wrong while updating the status"
            })
        }


    res.status(200).json({
        message:"Status updated successfully",
        result
    })

    }
    catch(err){
        
        res.status(500).json({
            message: err.message
        })

    }


    }

async function getCoupons(req,res){
    try{
        // Automatically deactivate any coupons that have expired.
        await couponModel.updateMany(
            { ends_At: { $lt: new Date() }, status: 'Active' },
            { $set: { status: 'inActive' } }
        );

        let coupons = await couponModel.find().sort({updatedAt:-1});
        // Use .length to check for an empty array
        if(!coupons || coupons.length === 0){
            return res.status(404).json({
                message:"No coupons found", coupons: []
            })
        }
        res.status(200).json({
            message:"Coupons fetched successfully",
            coupons
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })

    }
}

module.exports = { setCoupon, deleteCoupon, updateCoupon, couponStatus,getCoupons };
