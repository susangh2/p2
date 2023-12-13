import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { print } from "listening-on";
import { sessionMiddleware } from "./utils/session";
import matchingRoutes from "./routes/matching.routes";
import reviewsRoutes from "./routes/reviews.routes";
import pendingMatchesRoutes from "./routes/pending-matches.routes";
import matchedRoutes from "./routes/matched.routes";
import { registrationRouter } from "./routes/registration.routes";
import { HttpError } from "./utils/http-errors";
import { pmRouter } from "./routes/privatechatrm.routes";
import { loginRouter } from "./routes/login.routes";
import { profileRouter } from "./routes/profile.routes";
import { uploadDir } from "./utils/uploads";
import http from "http";
import { attachServer } from "./socketio/socket";
import { grantExpress } from "./utils/grantExpress";
import { env } from "./env";
import { indexRouter } from "./routes/index.routes";
import { userOnlyAPI } from "./utils/guard";

const app = express();
const server = http.createServer(app);
attachServer(server);

app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let blockPages = ["index", "matched", "matching-profiles"];
for (let blockPage of blockPages) {
  app.use(`/public/${blockPage}.html`, userOnlyAPI);
  app.use(`/${blockPage}.html`, userOnlyAPI);
}

app.use(express.static("public"));
app.use("/public", express.static("public"));

app.use("/uploads", express.static(uploadDir));

app.get("/", function (req: Request, res: Response) {
  res.redirect("/public");
});

app.use("/public", express.static("../public/"));
app.use(grantExpress as express.RequestHandler);

// Routers
app.use(profileRouter);
app.use(loginRouter);
app.use(registrationRouter);
app.use("/matching-profiles", matchingRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/pending-matches", pendingMatchesRoutes);
app.use("/matched", matchedRoutes);
app.use(pmRouter);
app.use(indexRouter);

app.use((req, res) => {
  res.status(404);
  // res.sendFile(path.resolve("..", "public", "404.html"));
  res.sendFile(path.resolve("public", "404.html"));
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(err.statusCode || 500);
  res.json({ error: String(err) });
  // res.json(err)
});

const port = env.PORT;
server.listen(port, () => {
  print(port);
});
