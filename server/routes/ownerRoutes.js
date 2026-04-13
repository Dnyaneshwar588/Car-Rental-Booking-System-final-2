import express from "express";
import { protect } from "../middleware/auth.js";
import { adminOnly, ownerOnly } from "../middleware/roleCheck.js";
import { addCar, deleteCar, getDashboardData, getOwnerAccessRequests, getOwnerCars, getAvailableCars, grantOwnerAccess, requestOwnerAccess, toggleCarAvailability, updateUserImage } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/add-car", protect, ownerOnly, upload.single("image"), addCar)
ownerRouter.get("/cars", protect, ownerOnly, getOwnerCars)
ownerRouter.get("/available-cars", getAvailableCars)
ownerRouter.post("/toggle-car", protect, ownerOnly, toggleCarAvailability)
ownerRouter.post("/delete-car", protect, ownerOnly, deleteCar)

ownerRouter.get('/dashboard', protect, ownerOnly, getDashboardData)
ownerRouter.post('/update-image', protect, ownerOnly, upload.single("image"), updateUserImage)
ownerRouter.post('/grant-owner-access', protect, ownerOnly, adminOnly, grantOwnerAccess)
ownerRouter.get('/access-requests', protect, ownerOnly, adminOnly, getOwnerAccessRequests)
ownerRouter.post('/request-access', requestOwnerAccess)

export default ownerRouter;