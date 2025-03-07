const express = require('express')
const router = express.Router()
const { isIdValid, checkUserPermission } = require('../middlewares/request')
const { isUserAuthenticated } = require('../middlewares/authentication')
const DisponibiliteService = require('../services/disponibiliteService')

router.post('/', isUserAuthenticated, checkUserPermission, DisponibiliteService.createAvailability)
router.put('/:id', isIdValid, isUserAuthenticated, checkUserPermission, DisponibiliteService.updateAvailability)
router.delete('/:id', isIdValid, isUserAuthenticated, checkUserPermission, DisponibiliteService.deleteAvailability)

module.exports = router