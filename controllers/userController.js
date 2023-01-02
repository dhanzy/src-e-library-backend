const { User } = require("../Model/userModel");
const Token = require("../Model/TokenModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emails/sendMail");
const crypto = require("crypto");

const clientURL = process.env.CLIENT_URL;

const registerUser = async (req, res) => {
  // check if the text fields are empty
  try {
    const { firstname, lastname, email, password, department, level, college } =
      req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !department ||
      !level ||
      !college
    ) {
      return res.status(400).json({ error: "Please fill in the fields" });
    }

    const constLEVEL = [100, 200, 300, 400, 500, 600];
    if (!constLEVEL.includes(Number(level))) {
      return res.status(400).json({ error: "Invalid Level" });
    }
    // check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists! " });
    } else {
      // hashpasword
      const salt = await bcrypt.genSalt(10);
      const hashpasword = await bcrypt.hash(password, salt);

      // create user
      const user = await User.create({
        name: `${firstname} ${lastname}`,
        email,
        department,
        level,
        password: hashpasword,
        college: college,
      });
      res.status(200).json({
        name: `${firstname} ${lastname}`,
        email,
        department,
        level,
        token: generateToken(user._id),
        roles: user.roles,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ error: "Anomaly detected!" });
  }
};

const loginUser = async (req, res) => {
  try {
    // get the fields
    const { email, password } = req.body;
    // check if the fields are there
    if (!email || !password) {
      res.status(400).json({ error: "password and email required" });
    }

    // get the user
    const user = await User.findOne({ email });

    // check if the passwords match
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        level: user.level,
        token: generateToken(user._id),
        roles: user.roles,
      });
    } else {
      res.status(400).json({ error: "incorrect email or password" });
    }
  } catch (err) {
    console.log(err.message);
    res.statu(401).json({ error: "Anomaly detected!" });
  }
};

const getUser = async (req, res) => {
  const { firstname, lastname, email, department, level, roles } =
    await User.findById(req.user.id);

  res.status(200).json({
    firstname,
    lastname,
    department,
    email,
    level,
    roles,
  });
};

const resetPasswordRequestContoller = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "An email is required!" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "User does not exist" });
  }
  const token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(resetToken, salt);

  await new Token({
    userId: user._id,
    token: hash,
  }).save();

  const link = `${clientURL}/resetpassword?token=${resetToken}&id=${user._id}`;

  sendEmail(
    user.email,
    "Password Reset Request",
    {
      name: `${user.name}`,
      link: link,
    },
    "./templates/requestResetPassword.handlebars"
  );

  res.status(200).json("Sent Reset Password Request!");
};

const resetPasswordController = async (req, res) => {
  const { userId, token, password } = req.body;
  const passwordResetToken = await Token.findOne({ userId });
  if (!passwordResetToken) {
    return res
      .status(400)
      .json({ error: "Invalid or Expired Password Reset Token" });
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    return res
      .status(400)
      .json({ error: "Invalid or Expired Password Reset Token" });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await User.findById({ _id: userId });
  if (!user) {
    return res
      .status(400)
      .json({ error: "Invalid or Expired Password Reset Token" });
  }
  await User.updateOne(
    { _id: user._id },
    { $set: { password: hash } },
    { new: true }
  );

  sendEmail(
    user.email,
    "Password Reset Successful",
    {
      name: `${user.name}`,
    },
    "./templates/resetPassword.handlebars"
  );
  await passwordResetToken.deleteOne();
  res.status(200).json("Updated Password Successfully");
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "60d",
  });
};

const changePasswordController = async (req, res) => {
  try {
    const { oldPassword, password } = req.body;
    const user = await User.findById(req.user.id);
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      if (oldPassword === password) {
        return res.status(400).json({
          error: "You can't use your old password as your new password",
        });
      }
      if (password.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be greater than 8 Characters" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashpasword = await bcrypt.hash(password, salt);
      user.password = hashpasword;
      user.save();
      return res.status(200).json("Password Changed Successfully");
    }
    res.status(400).json({ error: "Password does match with old password" });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  resetPasswordController,
  resetPasswordRequestContoller,
  changePasswordController,
};
