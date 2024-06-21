const express = require("express")
const router = express.Router()

//controller
const {register, getCurrentUser, login, update, getUserById} = require("../controllers/UserController")

//middlewares
const validate = require("../middlewares/handleValidation")
const authGuard = require("../middlewares/authGuard")
const { imageUpload } = require("../middlewares/imageUpload")
const {userCreateValidation, loginValidations, userUpdateValidation} = require("../middlewares/userValidation")

//routes
router.post("/register",userCreateValidation(),validate, register)
router.post("/login",loginValidations(),validate, login)
router.get("/profile", authGuard, getCurrentUser)
router.put("/", authGuard, userUpdateValidation(), validate, imageUpload.single("profileImage"), update)
router.get("/:id", getUserById)
module.exports = router;