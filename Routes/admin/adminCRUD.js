const express = require("express");
const userModel = require("../../Model/userModel");
const {getCustomers,deletecustomer,filterCustomers, getTotalCustomers} = require("../../Controllers/AdminControllers/AdminCustomerCont");

const router = express.Router();

//get customers
router.get("/getAllcustomers", getCustomers);

//deleting customers
router.delete("/deletecustomer/:id", deletecustomer);

//filter and get by alphabtes
router.post("/filter", filterCustomers);

//getting total number of customers for admin dashboard
router.get("/getCustomersCount", getTotalCustomers);



module.exports = router;