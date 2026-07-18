const express = require("express");
const { getProductById, filterProducts, getProductByPrice, getProductByName } = require("../../Controllers/Productfiltering/Productfiltering");
const router = express.Router();


//const {  getProductById,getProductByName, getProductByPrice, filterProducts } = require("../../Controllers/productscontroller.js/productscontroller");
          
router.get("/getprd/:id", getProductById);    
router.get("/getprdbyname/:name",getProductByName) ;
router.get("/getprdbyprice/:price",getProductByPrice);
router.get("/filter", filterProducts);
     
 
module.exports = router;