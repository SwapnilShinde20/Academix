import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { Student } from "../models/student.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";
import axios from "axios";

const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
}

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await Student.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        return next(new ApiError(500, "An error occurred while generating the access and refresh tokens. Please try again later."));
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    const { username, role, email, password } = req.body;

    if (
        [username, role, email, password].some((field) =>
            field?.trim() === "")
    ) {
        return next(new ApiError(400, "Please fill out all the required fields before submitting"));
    }

    const existedUser = await Student.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        return next(new ApiError(409, "An account with this email or username already exists. Please use a different one."));
    }

    let photoLocalPaths = [];

    if (req.files && Array.isArray(req.files.photo) && req.files.photo.length > 0) {
        photoLocalPaths = req.files.photo.map(file => file.path);
    }


    if (photoLocalPaths.length === 0) {
        return next(new ApiError(400, "Please upload an image file."));
    }

    const uploadedphotos = await Promise.all(
        photoLocalPaths.map(async (path) => {
            const photo = await uploadOnCloudinary(path);
            if (!photo) {
                throw new ApiError(500, "There was an issue uploading the file. Please try again.")
            }
            return photo.secure_url;
        })
    );

    const { data: encodeData } = await axios.post("http://localhost:5001/reg-encode", { img: uploadedphotos });

    if (encodeData.errors && encodeData.errors.length > 0) {
        const errorMessages = encodeData.errors.map(error => error.error || `Error with image: ${error.image_url}`);
        return next(new ApiError(500, `Face encoding failed: ${errorMessages.join(', ')}`));
    }

    const faceEncodings = encodeData.encodings;

    if (faceEncodings.length === 0) {
        return next(new ApiError(
            500, 
            "No valid face encodings were found. Please ensure the image contains a clear, visible face."
        ));
    }


    const user = await Student.create({
        username: username.toLowerCase(),
        role,
        email,
        password,
        photo: uploadedphotos,
        encoding: faceEncodings
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const createdUser = await Student.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        return next(new ApiError(500, "An error occurred while registering the user. Please try again later"));
    }

    return res.status(201)
              .cookie("accessToken", accessToken, options)
              .cookie("refreshToken", refreshToken, options)           
              .json(new ApiResponse(200, createdUser, "User registered successfully! Welcome aboard!")
    )

});

const loginUser = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;
    console.log("username",username);
    
    if (!(username)) {
        return next(new ApiError(400, "Please provide a username or email."))
    }

    const user = await Student.findOne({
        $or: [{ username }, { email: username }]
    })

    if (!user) {
        return next(new ApiError(404, "No user found. Please provide valid credentials"))
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return next(new ApiError(401, "Invalid User Credentials"));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await Student.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully! Welcome back!")
        )

})

const logOutUser = asyncHandler(async (req, res, next) => {
    await Student.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )


    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully. See you next time!"));
})

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return next(new ApiError(401, "You are not authorized to make this request. Please check your permissions."));
    }

    try {

        const decodedTOken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await Student.findById(decodedTOken?._id);

        if (incomingRefreshToken !== user?.refreshToken) {
            return next(new ApiError(401, "The refresh token has expired or has already been used. Please log in again."));
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", newRefreshToken)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully."
                )
            )
    } catch (error) {
        return next(new ApiError(401, error?.message || "The refresh token is invalid. Please log in again to continue."));
        }
})

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body

    if (!(newPassword === confirmPassword)) {
        return next(new ApiError(401, "The new password and confirm password must match. Please try again."));
    }

    const user = await Student.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
        return next(new ApiError(400, "The password entered is invalid. Please check and try again."));
    }

    if (newPassword === oldPassword) {
        return next(new ApiError(401, "The new password should be different from the old password. Please choose a unique one"));
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Your password has been changed successfully.")
        )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current User Fetched Successfully"));
})

const updateAccountDetails = asyncHandler(async (req, res, next) => {
    const { username, email } = req.body;

    const profileLocalPath = req.file?.path;

    if (!(username || email )) {
        return next(new ApiError("Please fill in all the required fields."));
    }

    let profileUrl;

    if (profileLocalPath) {
        const profile = await uploadOnCloudinary(profileLocalPath);
         profileUrl = profile.secure_url;
    }

    const user = await Student.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username,
                email,
                ...(profileUrl && { profile: profileUrl })
            }
        },
        { new: true }
    ).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }


    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account Has Been Updated Successfully"));

})

const setProfilePhoto = asyncHandler(async (req, res, next) => {
    const profileLocalPath = req.file?.path;

    if (!profileLocalPath) {
        return next(new ApiError(401, "Profile picture is missing. Please upload a profile image."));
    }

    const profile = await uploadOnCloudinary(profileLocalPath);

    if (!profile) {
        return next(new ApiError("There was an error while uploading the profile picture. Please try again later."));
    }

    const user = await Student.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profile: profile.secure_url
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Profile image uploaded successfully!")
        );

})


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    setProfilePhoto
}
