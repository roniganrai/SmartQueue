import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token)
    return res.status(401).json({ msg: "Not authorized, token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user)
      return res.status(401).json({ msg: "Not authorized, user not found" });
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: "Not authorized, token invalid" });
  }
};

export const allowRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "Not authorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ msg: "Forbidden" });
    next();
  };
