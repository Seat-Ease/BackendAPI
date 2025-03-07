const express = require('express')
const router = express.Router()
const AuthService = require('../services/authService')

router.post('/login', AuthService.login)
router.post('/logout', )

module.exports = router