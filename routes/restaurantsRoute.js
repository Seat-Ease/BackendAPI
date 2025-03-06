const express = require('express')
const router = express.Router()
const RestaurantService = require('../services/restaurantService')
const isIdValid = require('../middlewares/id')

router.post('/', RestaurantService.createRestaurantAccount)
router.get('/', RestaurantService.getRestaurants)
router.get('/:id', isIdValid, RestaurantService.getSpecificRestaurant)
router.put('/:id', isIdValid, RestaurantService.updateRestaurant)
router.delete('/:id', isIdValid, RestaurantService.deleteRestaurant)

module.exports = router