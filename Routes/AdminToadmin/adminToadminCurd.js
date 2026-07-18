
const express = require("express");
// const userModel = require("../../Model/userModel");
const {Addadmin,adminUpdate,getAlladmin,admindelete} =require("../../Controllers/adminToadminController/AdminToadminController") 
const router = express.Router();


router.post("/Addadmin",Addadmin)
router.put("/adminUpdate/:id",adminUpdate)
router.get("/getAll",getAlladmin)
router.delete("/admindelete/:id",admindelete)
module.exports = router;
