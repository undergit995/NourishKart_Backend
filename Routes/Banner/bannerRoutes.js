const express = require('express');
const { allBanners, setBanner, deleteBanner, updateBanner, bannerStatus } = require('../../Controllers/BannerController/Banners');
const isAdmin = require('../../MiddleWare/adminAuth');
const upload = require('../../config/multerConfig');

const router = express.Router()


router.get("/allBanners", allBanners)
router.post("/setBanner", isAdmin, upload.array("file", 5), setBanner)
router.delete("/deleteBanner/:id", isAdmin, deleteBanner)
router.put("/updateBanner/:id", isAdmin, upload.array("file", 5), updateBanner)
router.put("/bannerStatus/:id", isAdmin, bannerStatus)



module.exports = router;