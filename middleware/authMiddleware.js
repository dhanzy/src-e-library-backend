const jwt = require("jsonwebtoken");
const { User } = require("../Model/userModel");
const { Roles } = require("../utils/helper");

const userLoggedIn = async (req, res, next) => {
  let token;
  // jwt is a Bearer token that works with headers

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get the token from the header
      token = req.headers.authorization.split(" ")[1];
      if (!token) {
        next();
      }
      // verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        return res.status(400).json({ error: "You are already logged In." });
      }

      next();
    } catch (error) {
      console.log(error.message);
      next();
    }
  } else {
    next();
  }
};

const protect = async (req, res, next) => {
  let token;
  // jwt is a Bearer token that works with headers

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get the token from the header
      token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(403).json({ error: "Access Denied, No Token!" });
      }
      // verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // GET user
      req.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      console.log(error.message);
      res.status(403).json({ error: "Access Denied." });
    }
  } else {
    res.status(403).json({ error: "Access Denied." });
  }
};

const adminProtect = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user?.roles?.includes(Roles?.Admin)) {
      return res
        .status(403)
        .json({ error: "Access Denied! You are not authorized" });
    }
    next();
  } catch (error) {
    console.log(error.message);
    res.status(403).json({ error: "Access Denied! You are not authorized" });
  }
};

module.exports = {
  protect,
  adminProtect,
  userLoggedIn,
};
