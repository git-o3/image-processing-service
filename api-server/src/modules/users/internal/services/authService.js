import User from "../models/User.js";
import jwt from "jsonwebtoken";
import config from "../../../../config/index.js";
import { AppError } from "../../../../shared/error.js";

const signToken = (id) => {
    return jwt.sign({ id}, config.jwtSecret, { expiresIn: "7d"});
};

const register = async (username, password) => {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new AppError("Username is already taken.", 400);
    }

    const newUser = await User.create({ username, password });
    const token = signToken(newUser._id);

    return {
        token,
        user: { id: newUser._id, username: newUser.username }
    };
};

const login = async (username, password) => {
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

export default { register, login}
