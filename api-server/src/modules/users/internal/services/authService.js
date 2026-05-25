import User from "../models/User.js";
import jwt from "jsonwebtoken";
import config from "../../../../config/index.js";
import { AppError } from "../../../../shared/error.js";
import mongoose from "mongoose";

const signToken = (id) => {
    return jwt.sign({ id }, config.JWT_SECRET, { expiresIn: "7d"});
};

export const register = async (name, username, email, password) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const existingUsername = await User.findOne({ username })
        if (existingUsername) throw new AppError("Username is already taken.", 400)

        const existingEmail = await User.findOne({ email })
        if (existingEmail) throw new AppError("Email is already registered.", 400)

        const [newUser] = await User.create([{ name, username, email, password }], { session })
        const token = signToken(newUser._id)

        await session.commitTransaction()
        session.endSession()

        return {
            token,
            user: { id: newUser._id, username: newUser.username }
        }
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
};

export const login = async (username, password) => {
    if (!username || !password) {
        throw new AppError("Incorrect username or password.", 401);
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password, user.password))) {
        throw new AppError("Incorrect username or password.", 401);
    }

    const token = signToken(user._id);
    return {
        token,
        user: { id: user._id, username: user.username }
    };
};


