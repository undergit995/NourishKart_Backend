const express = require("express");
const userModel = require("../../Model/userModel");
const addressModel = require("../../Model/addressModel");
const photoModel = require("../../Model/photoModel");

// Customer profile update controller functions
async function updateCustomerProfile(req, res) {
    console.log("update profile")
    try {
        let userId = req.userId;

        console.log("User ID from token:", userId);

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID missing in token"
            });
        }

        let { name, password, phone } = req.body;

        if (!name && !password && !phone) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        console.log(name, password, phone);

        const user = await userModel.findById(userId);


        console.log(user);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.role !== "customer") {
            return res.status(403).json({
                message: "Customer access only",
            });
        }


        if (name) {
            user.name = name;
        }
        if (password) {
            user.password = password;
        }
        if (phone) {
            user.phone = phone;
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                name: user.name,
                password: user.password,
                phone: user.phone
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// delete customer profile controller function
async function deleteCustomerProfile(req, res) {
    try {

        let userId = req.userId;
        console.log("User ID from token:", userId);

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID missing in token"
            });
        }

        let result = await userModel.findByIdAndDelete(userId);

        if (!result) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "Profile deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

//get customer profile controller function
async function getCustomerProfile(req, res) {
    try {
        let userId = req.userId;
        console.log("User ID from token:", userId);
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID missing in token"
            });
        }
        const user = await userModel.findById(userId).select("-isVerified");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        res.status(200).json({
            message: "Profile retrieved successfully",
            user: user
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Customer photo upload controller functions
// async function postCustomerPhoto(req, res) {
//     console.log("postcustcgvhbjk")
//     try {
//         let userId = req.userId;
//         console.log("User ID from token:", userId);
//         if (!userId) {
//             return res.status(401).json({
//                 message: "Unauthorized: User ID missing in token"
//             });
//         }
//         if (!req.file) {
//             return res.status(400).json({
//                 message: "Validation Error: Please select an image file to upload."
//             });
//         }
//         console.log("File received:", req.file);

//         const rawpath = req.file.path;


//         const usefullUrl = rawpath.replace(/\\/g, "/");

//         const newPhoto = new userModel
//             ({
//                 userId,
//                 image: usefullUrl
//             });
//         await newPhoto.save();
//         res.status(201).json({
//             message: "Photo uploaded successfully",
//             photo: newPhoto
//         });
//     } catch (error) {
//         console.error("Error uploading photo:", error);
//         res.status(500).json({
//             message: "Internal server error"
//         });
//     }
// };

// // Customer photo update controller functions
// async function updateCustomerPhoto(req, res) {
//     try {
//         let userId = req.userId;
//         console.log("User ID from token:", userId);
//         if (!userId) {
//             return res.status(401).json({
//                 message: "Unauthorized: User ID missing in token"
//             });
//         }
//         if (!req.file) {
//             return res.status(400).json({
//                 message: "Validation Error: Please select an image file to upload."
//             });
//         }
//         console.log("File received:", req.file);
//         const rawpath = req.file.path;
//         const usefullUrl = rawpath;
//         const photo = await photoModel.findOne({ userId });
//         if (!photo) {
//             const newPhoto = new photoModel({
//                 userId,
//                 url: usefullUrl
//             });
//             await newPhoto.save();
//             res.status(201).json({
//                 message: "Photo updated successfully",
//                 photo: newPhoto
//             });
//         } else {
//             photo.url = usefullUrl;
//             await photo.save();
//             res.status(200).json({
//                 message: "Photo updated successfully",
//                 photo: photo
//             });
//         }
//     } catch (error) {
//         console.error("Error updating photo:", error);
//         res.status(500).json({
//             message: "Internal server error"
//         });
//     }
// }

//uploading and updating phtot
async function postCustomerPhoto(req, res) {
    try {

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image"
            });
        }

        const imagePath = req.file.path.replace(/\\/g, "/");

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const imageUrl = `${baseUrl}/${imagePath}`;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                image: imageUrl
            },
            {
                new: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Photo uploaded successfully",
            photo: imageUrl,
            user: updatedUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
//getcustomer Photo
async function getCustomerPhoto(req, res) {
    try {

        const user = await userModel.findById(req.userId);

        if (!user || !user.image) {
            return res.status(404).json({
                success: false,
                message: "Photo not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Photo retrieved successfully",
            photo: user.image
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//delete customer Photo
async function deleteCustomerPhoto(req, res) {
    try {
        let userId = req.userId;

        const user = await userModel.findById(userId);

        if (!user || !user.image) {
            return res.status(404).json({
                message: "Photo not found"
            });
        }

        user.image = "";
        await user.save();

        res.status(200).json({
            message: "Photo deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

// Customer adding address management controller functions
async function addingAddress(req, res) {
    try {
        let userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        let { label, street, city, state, pincode, country } = req.body;

        if (!label || !street || !city || !state || !pincode || !country) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check duplicate label for same user
        const existingLabel = await addressModel.findOne({
            userId,
            label: {
                $regex: new RegExp(`^${label.trim()}$`, "i")
            }
        });

        if (existingLabel) {
            return res.status(400).json({
                message: `${label} address already exists`
            });
        }

        const count = await addressModel.countDocuments({ userId });

        const newAddress = new addressModel({
            userId,
            label: label.trim(),
            street,
            city,
            state,
            pincode,
            country,
            isDefault: count === 0
        });

        await newAddress.save();

        res.status(201).json({
            message: "Address added successfully",
            address: newAddress
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Address label already exists"
            });
        }

        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Customer delete address management controller functions
async function deleteAddress(req, res) {
    try {
        let userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        let addressId = req.params.id;
        console.log("addressid :",addressId)
        const result = await addressModel.findOneAndDelete({
            _id: addressId,
            userId
        });
        console.log("result :",result)
        if (!result) {
            return res.status(404).json({
                message: "Address not found"
            });
        }
        if (result.isDefault) {
            const anotherAddress = await addressModel.findOne({ userId });

            if (anotherAddress) {
                anotherAddress.isDefault = true;
                await anotherAddress.save();
            }
        }

        return res.json({
            message: "Address deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Customer update address management controller functions
async function updateAddress(req, res) {
    try {

        let userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        let addressId = req.params.id;

        let { label, street, city, state, pincode, country } = req.body;

        const address = await addressModel.findOne({
            _id: addressId,
            userId
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        if (label) {

            const existingLabel = await addressModel.findOne({
                userId,
                _id: { $ne: addressId },
                label: {
                    $regex: new RegExp(`^${label.trim()}$`, "i")
                }
            });

            if (existingLabel) {
                return res.status(400).json({
                    message: "Label already exists"
                });
            }

            address.label = label.trim();
        }

        if (street) {
            address.street = street;
        }

        if (city) {
            address.city = city;
        }

        if (state) {
            address.state = state;
        }

        if (pincode) {
            address.pincode = pincode;
        }

        if (country) {
            address.country = country;
        }

        await address.save();

        res.status(200).json({
            message: "Address updated successfully",
            address
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Address label already exists"
            });
        }

        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Customer get addresses controller function
async function getCustomerAddresses (req, res) {
    try {
        let userId = req.userId;
        console.log("User ID from token:", userId); 
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID missing in token"
            });
        }
        const addresses = await addressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
        console.log("Addresses:", addresses);
        res.status(200).json({  
            message: "Addresses retrieved successfully",
            addresses: addresses
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }   
}

//get customer address by address id controller function
async function getCustomerAddressById(req, res) {
    try {   

        console.log("getphotos")
        let userId = req.userId;
        console.log("User ID from token:", userId); 
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID missing in token"
            });
        }   
        let addressId = req.params.id;
        const address = await addressModel.findOne({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({
                message: "Address not found or does not belong to user",
            });
        }
        res.status(200).json({
            message: "Address retrieved successfully",
            address: address
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function setDefaultAddress(req, res) {
    try {

        let userId = req.userId;
        let addressId = req.params.id;

        const address = await addressModel.findOne({
            _id: addressId,
            userId
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        await addressModel.updateMany(
            { userId },
            { $set: { isDefault: false } }
        );

        address.isDefault = true;
        await address.save();

        res.status(200).json({
            message: "Default address set successfully",
            address
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}


module.exports = {
    updateCustomerProfile,
    deleteCustomerProfile,
    addingAddress,
    deleteAddress,
    updateAddress,
    getCustomerProfile,
    postCustomerPhoto,
    getCustomerAddresses,
    getCustomerAddressById,
    setDefaultAddress,
    getCustomerPhoto,
    deleteCustomerPhoto
}
