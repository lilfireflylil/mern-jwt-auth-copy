import "dotenv/config";
import express from "express";
import { authRoutes } from "./routes/auth.route.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NODE_ENV, PORT } from "./constants/env.js";
import { connectToDatabase } from "./config/db.js";
import cookieParser from "cookie-parser";
import authenticate from "./middlewares/authenticate.js";
import userRoutes from "./routes/user.route.js";
import sessionRoutes from "./routes/session.route.js";

const app = express();

// middlewares
app.use(cookieParser());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.json({ status: "healthy" });
});

// auth routes
app.use("/auth", authRoutes);

// protected routers
app.use("/user", authenticate, userRoutes);
app.use("/sessions", authenticate, sessionRoutes);

// error handling
app.use(errorHandler);

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} environment.`);
    });
  } catch (error) {
    console.error("Server failed to start due to DB connection error.");
    process.exit(1); // exit if you want, or handle differently
  }
}
startServer();
