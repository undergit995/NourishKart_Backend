

const express = require('express');
const isAdmin = require('../../MiddleWare/adminAuth');
const {createCompany,updateCompany,getCompany,deleteCompany} = require("../../Controllers/CompanyControllers/CompanyDetails")
const router = express.Router();
 
const upload = require("../../Config/multerConfig")
router.post("/add",isAdmin,upload.single("file"),createCompany );
router.put("/update/:id", isAdmin, upload.single("file"), updateCompany);
router.put("/update:id",  isAdmin, updateCompany);
router.delete("/delete/:id", isAdmin, deleteCompany);

// Customer can view
router.get("/get", getCompany);


module.exports = router;
