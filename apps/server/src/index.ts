import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// Route imports
import userRoutes from "./routes/user.routes";
import jobRoutes from "./routes/job.routes";
import membershipRoutes from "./routes/membership.routes";
import couponRoutes from "./routes/coupon.routes";
import applicationRoutes from "./routes/application.routes";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import digioRoutes from "./routes/digio.routes";
import cashfreeRoutes from "./routes/cashfree.routes";
import otpRoutes from "./routes/otp.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(cookieParser());

// Healthcheck endpoint
app.get("/healthcheck", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/digio", digioRoutes);
app.use("/api/cashfree", cashfreeRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api", userRoutes);
app.use("/api", jobRoutes);
app.use("/api", applicationRoutes);
app.use("/api", membershipRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "ok", message: "Express + TypeScript Server running!" });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
