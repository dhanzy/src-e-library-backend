
const Admin = require("../Model/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body
    // check if the field is empty
    if (!name || !email || !password) {
        res.status(400).json({message: "Please fill the field"})
    }
    try {
        const adminExist = await Admin.findOne({ email })
        if (adminExist) {
            res.status(200).json({message: "Admin already exists"})
        }
        // harsh password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const admin = await Admin.create({
            name,
            email,
            password: hashedPassword
        })

        res.status(200).json({
            name,
            email,
            token: generateToken(admin._id)
         })

    } catch (error) {
        console.log(error)
    }
}


const loginAdmin = async (req, res) => {
    // get fields
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email })
    if (admin && (await bcrypt.compare(password, admin.password))) {
        res.status(200).json({
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            token: generateToken(admin._id),
          });
    }
}
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "60d",
    });
  };

module.exports = {
    registerAdmin,
    loginAdmin
}