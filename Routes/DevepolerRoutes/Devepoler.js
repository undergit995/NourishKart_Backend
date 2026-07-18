const express = require("express");
const {getDeveloperById} = require("../../Controllers/DevepolerModel/DevepolerModel");
const router = express.Router();

router.get("/", getDeveloperById);
//router.post("/", getDeveloperBydetails);

module.exports = router;
