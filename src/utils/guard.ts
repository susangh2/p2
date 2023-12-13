import express from "express";
import { HttpError } from "../utils/http-errors";
import "../utils/session";

export function userOnlyAPI(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.session?.user_id) {
    next();
    return;
  }
  let accept = req.headers.accept;
  if (accept?.includes("html")) {
    res.redirect("/login.html");
    return;
  }
  next(
    new HttpError(403, "This action is only avaliable to user, please login")
  );
}
