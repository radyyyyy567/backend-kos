import express from "express";
import {
    getBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner
} from "../controllers/Banners.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/banners',verifyUser, getBanners);
router.get('/banners/:id',verifyUser, getBannerById);
router.post('/banners',verifyUser, createBanner);
router.patch('/banners/:id',verifyUser, updateBanner);
router.delete('/banners/:id',verifyUser, deleteBanner);

export default router;