import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Car from "../models/Car.js";

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "car-rental" });

  const demoOwner = await User.findOne({ email: "owner@carrental.in" });
  const carFilter = demoOwner
    ? { $or: [{ owner: demoOwner._id }, { owner: null }, { owner: { $exists: false } }] }
    : { $or: [{ owner: null }, { owner: { $exists: false } }] };

  const deletedCars = await Car.deleteMany(carFilter);

  let deletedUsers = 0;
  if (demoOwner) {
    const deleted = await User.deleteOne({ _id: demoOwner._id });
    deletedUsers = deleted.deletedCount || 0;
  }

  const remainingCars = await Car.countDocuments();
  console.log(JSON.stringify({ deletedCars: deletedCars.deletedCount, deletedUsers, remainingCars }));

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
