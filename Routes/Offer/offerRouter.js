let express = require("express");
const { getOffers, setOffer, deleteOffer, updateOffer, updateStatus } = require("../../Controllers/OfferController/offer");
const isAdmin = require("../../MiddleWare/adminAuth");
const upload = require("../../config/multerConfig");
let router = express.Router();


router.get("/getOffers",getOffers)
router.post("/setOffer",isAdmin,upload.array("file", 5),setOffer)
router.delete("/deleteOffer/:id",isAdmin,deleteOffer)
router.put("/updateOffer/:id",isAdmin,upload.array("file", 5),updateOffer)
router.put("/updateStatus/:id",isAdmin,updateStatus)



module.exports = router;