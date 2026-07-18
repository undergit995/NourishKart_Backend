const express = require("express");
const userModel = require("../../Model/userModel");


async function getCustomers(req, res) {
    try {

        let customers = await userModel.find({role : "customer"}).select("-password");
        if (!customers) {
            return res.status(404).json({
                message: "No customers found",
            });
        }

        res.status(200).json(customers)

        console.log(customers);

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });

    }
}

async function deletecustomer(req, res) {
    try {

        let id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message: "Invalid Request",
            });

        }
        let customer = await userModel.findByIdAndDelete({ _id: id });
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found",
            });
        }
        res.status(200).json({
            message: "Customer deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function filterCustomers(req, res) {
    try {

        let query = req.body.query

        console.log(query);

        if (!query) {

            return res.status(400).json({
                message: "Invalid Request",
            });

        }

        let customers = await userModel.find({ name: { $regex: query, $options: "i" } });

        console.log(customers);

        if (customers.length === 0) {
            return res.status(404).json({
                message: "No customers found",
            });
        }

        res.json(customers);


    } catch (error) {
        res.status(500).json({

            message: "Internal Server Error",
            error: error.message

        });
    }
}

async function getTotalCustomers(req, res) {
    try {
        const count = await userModel.countDocuments({ role: "customer" }); 
        res.status(200).json({ totalCustomers: count });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { getCustomers, deletecustomer, filterCustomers, getTotalCustomers };