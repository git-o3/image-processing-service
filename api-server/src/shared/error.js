class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
 }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (config.nodeEnv === "development") {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });

    } else {
        // production view(zero leaking internals)
        res.status(err.statusCode).json({
            status: err.status,
            message: err.isOperational ? err.message : "Something went wrong on our end."
        });
    }
};

export {
    AppError,
    errorHandler
}