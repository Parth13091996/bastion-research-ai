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
import analyticsRoutes from "./routes/analytics.routes";
import authRoutes from "./routes/auth.routes";
import digioRoutes from "./routes/digio.routes";
import cashfreeRoutes from "./routes/cashfree.routes";
import otpRoutes from "./routes/otp.routes";
import kraRoutes from "./routes/kra.routes";

dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT) || 3001;

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
app.use("/api/kra", kraRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api", userRoutes);
app.use("/api", jobRoutes);
app.use("/api", applicationRoutes);
app.use("/api", membershipRoutes);
app.use("/api/analytics", analyticsRoutes);

app.set("trust proxy", 1); // if you use secure cookies or rely on req.protocol

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "ok", message: "Express + TypeScript Server running!" });
});

const host = "0.0.0.0"
app.listen(port,host, () => {
  console.log(`[server]: Server is running at http://${host}:${port}`);
});

export default app;
