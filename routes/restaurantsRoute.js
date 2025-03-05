const express = require('express')
const router = express.Router()
const RestaurantService = require('../services/restaurantService')

router.post('/', RestaurantService.createRestaurantAccount)
router.get('/', RestaurantService.getRestaurants)
router.get('/:id', RestaurantService.getSpecificRestaurant)
router.put('/:id', RestaurantService.updateRestaurant)
router.delete('/:id', RestaurantService.deleteRestaurant)

module.exports = router