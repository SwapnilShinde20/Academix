import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Classroom } from "./classroom.models.js";

const studentSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    role: {
        type: String,
        index: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        type: String,
    },
    photo: [{
        type: String,
    }],
    classId: [
        {
            type: Schema.Types.ObjectId,
            ref: Classroom,
            index: true,
        }
    ],
    classCode: [
        {
            type: String,
            index: true
        }
    ],
    encoding: {
        type: [[Number]],
        required: true
    }
    ,
    refreshToken: {
        type: String,
    }
}, { timestamps: true })

studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

studentSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

studentSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        role: this.role
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

studentSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this.id,
    },
        process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const Student = mongoose.model("Student", studentSchema);