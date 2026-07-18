const express = require("express");


const { addCategory, updateCategory, getCategory, deleteCategory } = require("../../Controllers/CategoryController/productCategorycont");
const router = express.Router();


//aading new category
router.post("/addProductCategory", addCategory);

//update category
router.put("/updateProductCategory/:id", updateCategory);
    

//get all categories
router.get("/allCategories", getCategory);

//delete category
router.delete("/deleteProductCategory/:id",deleteCategory);



module.exports = router;
