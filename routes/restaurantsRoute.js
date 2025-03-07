const express = require('express')
const router = express.Router()
const RestaurantService = require('../services/restaurantService')
const { isIdValid, restaurantAccountCreationMiddleware, checkUserPermission } = require('../middlewares/request')
const { isUserAuthenticated } = require('../middlewares/authentication')

router.post('/', restaurantAccountCreationMiddleware, RestaurantService.createRestaurantAccount)
router.get('/', RestaurantService.getRestaurants)
router.get('/:id', isIdValid, RestaurantService.getSpecificRestaurant)
router.put('/:id', isIdValid, isUserAuthenticated, checkUserPermission, RestaurantService.updateRestaurant)
router.delete('/:id', isIdValid,  isUserAuthenticated, checkUserPermission, RestaurantService.deleteRestaurant)

module.exports = router