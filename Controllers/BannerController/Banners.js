const bannerModel = require("../../Model/bannerSchema");
const ProductModel = require("../../Model/ProductModel");




async function allBanners(req, res) {
    try {

        let banners = await bannerModel.find().populate("product coupon");
        if (!banners) {
            return res.status(400).json({
                message: "No banners found"
            })
        }
        res.status(200).json({
            message: "Banners fetched successfully",
            banners
        })

    }
    catch (err) {
        res.status(500).json({
            message: err.message
        })

    }

}

async function  setBanner(req, res) {
    try {
        const body = req.body;

        // Clean up accidental spaces in keys sent by frontend FormData
        Object.keys(body).forEach(key => {
            const trimmedKey = key.trim();
            if (trimmedKey !== key) {
                body[trimmedKey] = body[key];
                delete body[key];
            }
        });

        if (!body.title || !body.description) {
            return res.status(400).json({ 
                message: "Missing required fields: 'name', 'title', 'description', and 'user' are required." 
            });
        }

        let imagePaths;

        // If a product is linked, use its images. Otherwise, use uploaded files.
        if (body.product && body.product !== "undefined" && body.product !== "") {
            const product = await ProductModel.findById(body.product);
            if (!product) {
                return res.status(404).json({ message: "Associated product not found." });
            }
            if (!product.image || product.image.length === 0) {
                return res.status(400).json({ message: "The associated product has no images to use for the banner." });
            }
            imagePaths = product.image;
        } else {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: "At least one banner image is required when no product is linked." });
            }
            imagePaths = req.files.map(file => `${req.protocol}://${req.get('host')}/${file.path}`);
        }

        const bannerData = {
            ...body,
            image: imagePaths
        };

        // Prevent CastError if frontend sends empty strings or "undefined" for ObjectIds
        if (!bannerData.product || bannerData.product === "undefined" || bannerData.product === "") delete bannerData.product;
        if (!bannerData.coupon || bannerData.coupon === "undefined" || bannerData.coupon === "") delete bannerData.coupon;

        const newBanner = await bannerModel.create(bannerData);
        if (!newBanner) {
            return res.status(400).json({
                message: "Something went wrong while creating the banner."
            });
        }
        res.status(201).json({
            message: "Banner added successfully",
            newBanner
        });
    } catch (err) {
        res.status(500).json({
            message: "Error creating banner", error: err.message
        });
    }
}



async function deleteBanner(req, res) {
    try {
        let id = req.params.id;
        let banner = await bannerModel.findByIdAndDelete(id);
        if (!banner) {
            return res.status(400).json({
                message: "Banner not found"
            })
        }
        res.status(200).json({
            message: "Banner deleted successfully",
            banner
        })
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

async function updateBanner(req,res){
    try{
        let id = req.params.id;
        const updateData = { ...req.body };
        
        let existingImages = [];
        if (updateData.existingImages) {
            try {
                existingImages = JSON.parse(updateData.existingImages);
            } catch (e) {
                return res.status(400).json({ message: "Invalid format for existingImages." });
            }
        }
        
        
        let newImagePaths = [];
        if (req.files && req.files.length > 0) {
            newImagePaths = req.files.map(file => `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, "/")}`);
        }
        updateData.image = [...existingImages, ...newImagePaths];

        if (!updateData.image) {
            return res.status(400).json({
                message: "Image is required"
            })
        }


        let banner = await bannerModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if(!banner){
            return res.status(404).json({
                message:"Banner not found"
            })
        }

        res.status(200).json({
            message:"Banner updated successfully",
            banner
        })
    }
    catch(err){
        res.status(500).json({
            message: "Error updating banner", error: err.message
        })
    }
}

async function bannerStatus(req,res){
    try{
        let id = req.params.id;
        let status = req.body.status;
        if(!status){
            return res.status(400).json({
                message:"Status is required"
            })
        }
        let banner = await bannerModel.findById(id);

        if(!banner){
            return res.status(404).json({
                message:"Banner not found"
            })
        }
        if(banner.status === status){
            return res.status(400).json({
                message:`Banner is already in this ${banner.status} status`
            })
        }

        let result = await bannerModel.findByIdAndUpdate(id,{status},{new:true, runValidators:true})

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

    }
}



module.exports = { allBanners, setBanner, deleteBanner, updateBanner, bannerStatus};