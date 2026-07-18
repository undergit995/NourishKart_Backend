const mongoose = require("mongoose");
const ProductModel = require("../../Model/ProductModel");

async function getProductById(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID"
            });
        }

        const product = await ProductModel.findById(id).populate("category");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function getProductByName(req, res) {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });
        }

        const products = await ProductModel.find({
            name: { $regex: name, $options: "i" }
        });

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found"
            });
        }

        return res.status(200).json({
            success: true,
            data: products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function getProductByPrice(req, res) {
    try {
        const { price } = req.params;

        if (!price || isNaN(price)) {
            return res.status(400).json({
                success: false,
                message: "Valid price is required"
            });
        }

        const products = await ProductModel.find({
            price: Number(price)
        });

        return res.status(200).json({
            success: true,
            data: products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function filterProducts(req, res) {
    try {
        const {
            name,
            description,
            search,
            category,
            minPrice,
            maxPrice,
            isAvailable,
            inStock,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        let filter = {};

        // Name filter
        if (name) {
            filter.name = {
                $regex: name,
                $options: "i"
            };
        }

        // Description filter
        if (description) {
            filter.description = {
                $regex: description,
                $options: "i"
            };
        }

        // Search in name and description
        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // Category filter
        if (category) {
            filter.category = {
                $regex: category,
                $options: "i"
            };
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};

            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        // Availability filter
        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === "true";
        }

        // Stock filter
        if (inStock === "true") {
            filter.stock = {
                $gt: 0
            };
        }

        // Sorting
        let sortOption = {};

        switch (sort) {
            case "price_asc":
                sortOption.price = 1;
                break;

            case "price_desc":
                sortOption.price = -1;
                break;

            case "name_asc":
                sortOption.name = 1;
                break;

            case "name_desc":
                sortOption.name = -1;
                break;

            case "newest":
                sortOption.createdAt = -1;
                break;

            case "oldest":
                sortOption.createdAt = 1;
                break;

            default:
                sortOption.createdAt = -1;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const products = await ProductModel.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const totalProducts = await ProductModel.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalProducts,
            currentPage: Number(page),
            totalPages: Math.ceil(totalProducts / Number(limit)),
            count: products.length,
            data: products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getProductById,
    getProductByPrice,
    getProductByName,
    filterProducts
};