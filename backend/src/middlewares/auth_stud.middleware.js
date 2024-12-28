import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Student } from "../models/student.models.js";

export const stud_verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");

        if (!token) {
            return next(new ApiError(401, "Unauthorized request. Please check your permissions or log in again."));
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await Student.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return next(new ApiError(401, "The access token is invalid. Please log in again."))
        }

        req.user = user;

        next();
    } catch (error) {
        return next(new ApiError(401, error?.message || "The access token is invalid. Please ensure you're logged in and try again."))
    }
})
