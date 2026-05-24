import * as authService from "../services/authService.js";

const register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await authService.register(username, password);

        res.status(201).json({
            status: "success",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);

        res.status(200).json({
            status: "success",
            data: result
        });
    } catch (error) {
        next(error)
    }
};

export default { register, login};
