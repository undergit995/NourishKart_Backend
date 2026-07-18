const express = require("express");
const userModel = require("../../Model/userModel");

async function getAlladmin(req,res) {

    try{
       const allAdminData = await userModel.find({role:"admin"})
       res.status(200).json({

        message:"admin All Data succesfully fatched",
        data:allAdminData
    }) 

    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
    
}

async function Addadmin(req, res) {
    try {
        const { name, email, password, phone } = req.body;

        const existingAdmin = await userModel.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }
        console.log("REQ BODY:", req.body);
        console.log("PASSWORD:", password);
        const admin = await userModel.create({
            name,
            email,
            password,
            phone,
            role: "admin"
        });

        if (!password) {
            return res.status(400).json({
                message: "Password missing from request",
                body: req.body
            });
        }
        return res.status(201).json({
            message: "Admin created successfully",
            admin
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

async function adminUpdate(req, res) {
    try {
        const { id } = req.params
        // let updated = await userModel.findByIdAndUpdate(id, req.body, { new: true })
        const updated = await userModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }
        return res.status(200).json({
            message: "Admin updated successfully",
            data: updated
        })
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

async function admindelete(req, res) {
    try {
        const { id } = req.params;

        const deleteData = await userModel.findByIdAndDelete(id);

        if (!deleteData) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        return res.status(200).json({
            message: "Admin deleted successfully",
            data: deleteData
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}
    

module.exports = { Addadmin, adminUpdate,getAlladmin,admindelete }