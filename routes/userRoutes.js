const express = require('express')
const {loginUser,registerUser,allUsers} = require('../controllers/userController')
const { requireAuth } = require('../middleware/authMiddleware')

const router =  express.Router()  //used to create a modular, mountable router instance

//login route
router.post('/login',loginUser)

//register route
router.post('/register',registerUser)

router.get('/',requireAuth, allUsers)


module.exports = router