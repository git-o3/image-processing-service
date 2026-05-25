import express from "express";
import config from "./config/index.js";
import { connectDB } from "./shared/db.js";
import { AppError, errorHandler } from "./shared/error.js";
import { authRouter } from "./modules/users/index.js";
import { imageRouter } from "./modules/images/index.js"
import { connectBroker } from "./shared/broker.js";
import { initStatusConsumer } from "./modules/images/internal/workers/statusUpdateConsumer.js";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use('/api/v1/images', imageRouter);

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(errorHandler);

async function bootstrap() {
  try {
    console.log("🚀 Initializing Modular Monolith Infrastructure Lifecycle..");

    //  establish data store connectivity
    await connectDB();

     // initialize messaging broker loop
    await connectBroker();
    await initStatusConsumer(); // background status listener

    // open HTTP communication channels
    app.listen(config.PORT, () => {
      console.log(
        `Server running on port ${config.PORT} in ${config.env} mode Chief 🫡`,
      );
    });
  } catch (error) {
    console.error(" Critical System Orchestration Failure:", error.message);
    process.exit(1);
  }
}

// fire up the engine
bootstrap();
