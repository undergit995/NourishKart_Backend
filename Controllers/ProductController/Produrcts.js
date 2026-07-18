const express = require("express");
const ProductModel = require("../../Model/ProductModel");
const sendProductNotification = require("../../Utils/sendProductNotification");
const ProductCategoryModel = require("../../Model/productCategoryModel")
const cache = require("../../Config/cache")


async function allProduct(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const cacheKey = `products-${page}-${limit}`;
        // console.log(cacheKey?"yes":"no")
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: "cache",
                ...cachedData
            });
        }

        const totalProducts = await ProductModel.countDocuments();

        // First test WITHOUT populate
        const products = await ProductModel.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const response = {
            page,
            limit,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            data: products
        };

        cache.set(cacheKey, response);

        return res.status(200).json({
            success: true,
            source: "db",
            ...response
        });

    } catch (err) {
        console.error("ERROR:", err);

        return res.status(500).json({
            success: false,
            message: err.message,
            stack: err.stack
        });
    }
}
async function addProduct(req, res) {
    try {
        const { name, description, price, stock, discount } = req.body;

        // Check uploaded images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "Product image is required"
            });
        }
        // Convert file paths to URLs
        const imagePaths = req.files.map(file =>
            `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`
        );

        // console.log("Category from request:", req.body.category);

        const category = await ProductCategoryModel.findOne({
            _id: req.body.category.trim()
        });


        if (!category) {
            return res.status(400).json({
                message: "Category not found"
            });
        }
        const discountAmount = (Number(price) * Number(discount)) / 100;

        const finalPrice = Number(price) - discountAmount;
        // Create product
        const product = await ProductModel.create({
            name,
            description,
            price: Number(price),
            stock: Number(stock),
            discount: Number(discount),
            finalPrice,
            category: category._id,
            image: imagePaths
        });
        // const products = await ProductModel.create(product);

        if (req.body.sendUpdates == "on") {
            sendProductNotification(products)
        }
         cache.flushAll();
        const Product = await ProductModel.findById(products._id)
            .populate("category", "name");

        return res.status(200).json({
            message: "Product added successfully",
            data: Product
        });

       
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}





async function updateProduct(req, res) {
    try {
        const id = req.params.id;
        const ProductData = { ...req.body };
        ProductData.existingPhotos = JSON.parse(
            req.body.existingPhotos || "[]"
        );

        let imagePaths = [];

        if (req.files?.length > 0) {
            imagePaths = req.files.map(
                (file) =>
                    `${req.protocol}://${req.get("host")}/${file.path.replace(
                        /\\/g,
                        "/"
                    )}`
            );
        }

        ProductData.image = [
            ...ProductData.existingPhotos,
            ...imagePaths,
        ];


        if (req.files?.length > 0) {
            imagePaths = req.files.map(
             `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`

            );
        }

        ProductData.image = [
            ...ProductData.existingPhotos,
            ...imagePaths,
        ];

        if (ProductData.price && ProductData.discount) {
            const discountAmount =
                (Number(ProductData.price) * Number(ProductData.discount)) / 100;

            ProductData.finalPrice =
                Number(ProductData.price) - discountAmount;
        }

        const product = await ProductModel.findByIdAndUpdate(
            id,
            ProductData,
            { new: true }
        );
          cache.flushAll();
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
        
    }


    catch (err) {
        console.log(err.message);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}




async function deleteProduct(req, res) {

    try {
        let id = req.params.id
        let data = await ProductModel.findByIdAndDelete(id);
        if (!data) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.status(200).json({
            message: "Product successful delete",
        })
        cache.flushAll();
    }
    catch (error) {
        res.status(500).json({
            message: "server error", error: error.message
        })
    }

}

async function getTotalProducts(req, res) {
    try {
        const count = await ProductModel.countDocuments();
        res.status(200).json({ totalProducts: count });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getProductsByCategory(req, res) {
    try {
        const groupedProducts = await ProductModel.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "productcategories", // The collection name for ProductCategoryModel
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$categoryDetails.name",
                    products: { $push: "$$ROOT" }
                }
            }
        ]);

        return res.status(200).json({
            message: "Products fetched successfully",
            data: groupedProducts
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

async function getProductById(req, res) {
    try {
        const product = await ProductModel.findById(req.params.id)
            .populate("category");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product fetched successfully",
            data: product
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

module.exports = { addProduct, updateProduct, deleteProduct, allProduct, getTotalProducts, getProductsByCategory, getProductById }