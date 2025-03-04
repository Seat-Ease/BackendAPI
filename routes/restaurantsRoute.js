const express = require('express')
const router = express.Router()
const RestaurantService = require('../services/restaurantService')

router.post('/', RestaurantService.createRestaurantAccount)

module.exports = router