const express = require("express");
const {getDeveloperById} = require("../../Controllers/DevepolerModel/DevepolerModel");
const router = express.Router();

router.get("/", getDeveloperById);
module.exports = router;
