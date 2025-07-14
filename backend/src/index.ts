import "dotenv/config";
import express from "express";
import { authRoutes } from "./routes/auth.route.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NODE_ENV, PORT } from "./constants/env.js";
import { connectToDatabase } from "./config/db.js";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(cookieParser());
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.json({ status: "healthy" });
});

app.use("/auth", authRoutes);

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
