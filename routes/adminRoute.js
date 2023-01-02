const express = require("express")
const { registerAdmin, loginAdmin } = require("../controllers/adminController")
const router = express.Router()
const {protect} = require("../middleware/authMiddleware")

router.post("/", registerAdmin)
router.post("/login", protect, loginAdmin)



module.exports = router