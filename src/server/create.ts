import chalk from "chalk";
import config from "../config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import mainRouter from "../router";
import cookieParser from "cookie-parser";
import customLogger from "../utils/request_logger";
import { RateLimiterMemory } from "rate-limiter-flexible";

const createServer = () => {
  const router = express();

  const allowedOrigins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://95.76.109.39",
    "https://eco-ltsh.vercel.app",
    "https://eco-ltsh-epwdje5gs-tiron9504s-projects.vercel.app",
  ];

  // CORS Policy Settings
  router.use(
    cors({
      origin: true,
      credentials: true,
      methods: "GET,POST,PUT,DELETE,OPTIONS",
      allowedHeaders: [
        "Content-Type,Authorization,Cross-Origin-Resource-Policy,Access-Control-Allow-Origin",
      ],
    })
  );

  router.options("*", cors());

  router.use((req, res, next) => {
    try {
      if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET,POST,PUT,DELETE,OPTIONS"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        return res.status(200).end();
      }

      res.setHeader("Access-Control-Allow-Origin", "*");

      next(); // Continue to next middleware/route handler for non-OPTIONS requests
    } catch (err) {
      // Handle any unexpected errors
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Additional headers
  router.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  router.use(express.json({ limit: "100mb" }));
  router.use(express.urlencoded({ limit: "100mb", extended: true }));
  router.use(cookieParser());

  // disable x-powered-by for anti-tracking
  router.disable("x-powered-by");

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  config.server.mode === "testing" && router.use(customLogger());

  // Rate Limiter
  const rateLimiter = new RateLimiterMemory({
    points: 120,
    duration: 60,
  });

  router.use((req, res, next) => {
    const ip = req.ip || "127.0.0.1";
    rateLimiter
      .consume(ip)
      .then(() => {
        next();
      })
      .catch(() => {
        res.status(429).json({ error: "Too many requests! Try again later!" });
      });
  });

  router.use("/eco-ltsh/api", mainRouter);

  router.listen(config.server.port, "0.0.0.0", () => {
    console.log(
      chalk`🚀 {rgb(0,0,255) Eco - LTSH backend is listening on port ${
        config.server.port
      }.} {rgb(255, 10, 120) [${new Date().toDateString()}]} 🌲!`
    );
  });
};

export default createServer;
