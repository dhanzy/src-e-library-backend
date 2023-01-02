const express = require("express");
const cors = require("cors");
const colors = require("colors");
const app = express();
const fs = require("fs");
require("dotenv").config();
const morgan = require("morgan");
const { connectionDB } = require("./config/db");
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const PORT = process.env.PORT || 3100;

connectionDB();
// @middleware

// const accessLogStream = fs.createWriteStream(__dirname + "/logs/access.log", {
//   flags: "a",
// });
// app.use(morgan("dev", {stream: accessLogStream}));

const whitelist = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://src-e-library.vercel.app",
  "http://src-e-library.vercel.app",
];
const corOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // callback(new Error("Not allowed CORS"));
      callback(null, true);
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corOptions));

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true,
//   })
// );

// @custom middleware

app.use("/api/users", require("./routes/userRoute"));
app.use("/api", require("./routes/documentRoute"));
app.use("/api/admin", require("./routes/adminRoute"));

app.get("/", async (req, res) => {
  res.status(200).json({ success: "Okay" });
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`.bold);
});
