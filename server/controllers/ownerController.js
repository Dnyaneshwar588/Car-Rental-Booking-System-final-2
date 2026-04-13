import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import OwnerAccessRequest from "../models/OwnerAccessRequest.js";
import User from "../models/User.js";
import fs from "fs";

// API to List Car

export const addCar = async (req, res)=>{
    try {
        const {_id} = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        // Upload Image to ImageKit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })

        // optimization through imagekit URL transformation
        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation : [
                {width: '1280'}, // Width resizing
                {quality: 'auto'}, // Auto compression
                { format: 'webp' }  // Convert to modern format
            ]
        });

        const image = optimizedImageUrl;
        await Car.create({...car, owner: _id, image})

        res.json({success: true, message: "Car Added"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to List Owner Cars (Only their own cars)
export const getOwnerCars = async (req, res)=>{
    try {
        const {_id} = req.user;
        const cars = await Car.find({owner: _id })
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to Get Available Cars for Booking (Authenticated users only)
export const getAvailableCars = async (req, res) =>{
    try {
        const cars = await Car.find({isAvaliable: true, owner: {$ne: null}})
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to Toggle Car Availability
export const toggleCarAvailability = async (req, res) =>{
    try {
        const {_id} = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        // Checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized" });
        }

        car.isAvaliable = !car.isAvaliable;
        await car.save()

        res.json({success: true, message: "Availability Toggled"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Api to delete a car
export const deleteCar = async (req, res) =>{
    try {
        const {_id} = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        if (!car) {
            return res.json({ success: false, message: "Car not found" });
        }

        // Checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized" });
        }

        await Car.findByIdAndDelete(carId)

        res.json({success: true, message: "Car Removed"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to get Dashboard Data
export const getDashboardData = async (req, res) =>{
    try {
        const { _id, role } = req.user;

        if(role !== 'owner'){
            return res.json({ success: false, message: "Unauthorized" });
        }

        const cars = await Car.find({owner: _id})
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({owner: _id, status: "pending" })
        const completedBookings = await Booking.find({owner: _id, status: "confirmed" })

        // Calculate monthlyRevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking)=> acc + booking.price, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0,3),
            monthlyRevenue
        }

        res.json({ success: true, dashboardData });

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to update user image

export const updateUserImage = async (req, res)=>{
    try {
        const { _id } = req.user;

        const imageFile = req.file;

        // Upload Image to ImageKit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })

        // optimization through imagekit URL transformation
        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation : [
                {width: '400'}, // Width resizing
                {quality: 'auto'}, // Auto compression
                { format: 'webp' }  // Convert to modern format
            ]
        });

        const image = optimizedImageUrl;

        await User.findByIdAndUpdate(_id, {image});
        res.json({success: true, message: "Image Updated" })

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API for admin to grant owner access to existing customer
export const grantOwnerAccess = async (req, res) => {
    try {
        const { email, requestId } = req.body;
        let user = null;
        let requestRecord = null;

        if (requestId) {
            requestRecord = await OwnerAccessRequest.findById(requestId);
            if (!requestRecord) {
                return res.json({ success: false, message: "Request not found" });
            }
            user = await User.findById(requestRecord.user);
        } else if (email) {
            const normalizedEmail = email.trim().toLowerCase();
            user = await User.findOne({ email: normalizedEmail });
        } else {
            return res.json({ success: false, message: "Request id or email is required" });
        }

        if (!user) {
            return res.json({ success: false, message: "No user found with this email" });
        }

        if (user.role === "owner") {
            return res.json({ success: false, message: "User already has owner access" });
        }

        user.role = "owner";
        await user.save();

        if (requestRecord) {
            requestRecord.status = "approved";
            await requestRecord.save();
        }

        await OwnerAccessRequest.updateMany(
            { email: user.email.toLowerCase(), status: "pending" },
            { $set: { status: "approved" } }
        );

        res.json({ success: true, message: "Owner access granted successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API for customers to request owner access
export const requestOwnerAccess = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.json({ success: false, message: "No registered customer found with this email" });
        }

        if (user.role === "owner") {
            return res.json({ success: false, message: "This user already has owner access" });
        }

        const pending = await OwnerAccessRequest.findOne({ email: normalizedEmail, status: "pending" });
        if (pending) {
            return res.json({ success: false, message: "Request already submitted and pending approval" });
        }

        await OwnerAccessRequest.create({
            user: user._id,
            email: normalizedEmail,
            status: "pending",
        });

        res.json({ success: true, message: "Owner access request submitted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API for admin to list owner access requests
export const getOwnerAccessRequests = async (req, res) => {
    try {
        const requests = await OwnerAccessRequest.find({ status: "pending" })
            .populate("user", "name email createdAt")
            .sort({ createdAt: -1 });

        res.json({ success: true, requests });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}