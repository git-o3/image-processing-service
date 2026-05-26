import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import User from "./internal/models/User.js";
import { AppError } from "../../shared/error.js";

const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        
        if (!token) {
         return next(new AppError("You are not logged in. Please log in to get access.", 401));
       }

       const decoded = jwt.verify(token, config.JWT_SECRET);

       const currentUser = await User.findById(decoded.id);
       if (!currentUser) {
        return next(new AppError("The user no longer exists.", 401));
       }

       // pass through buddy
       req.user = currentUser;
       next();
    } catch (error) {
        next(new AppError("Invalid or expired authentication.", 401))
    }
      
};

export { protect };
