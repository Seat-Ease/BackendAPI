const express = require('express')
const router = express.Router()
const RestaurantService = require('../services/restaurantService')
const TableService = require('../services/tableService')
const { restaurantAccountCreationMiddleware, checkUserPermission } = require('../middlewares/request')
const { isUserAuthenticated } = require('../middlewares/authentication')

router.post('/', restaurantAccountCreationMiddleware, RestaurantService.createRestaurantAccount)
router.get('/', RestaurantService.getRestaurants)
router.get('/:id', RestaurantService.getSpecificRestaurant)
router.put('/:id', isUserAuthenticated, checkUserPermission, RestaurantService.updateRestaurant)
router.delete('/:id', isUserAuthenticated, checkUserPermission, RestaurantService.deleteRestaurant)

router.post('/:id_restaurant/tables', isUserAuthenticated, checkUserPermission, TableService.createTable)
router.get('/:id_restaurant/tables', TableService.getRestaurantTables)
router.get('/:id_restaurant/tables/:id_table', TableService.getSpecificRestaurantTable)
router.put('/:id_restaurant/tables/:id_table', isUserAuthenticated, checkUserPermission, TableService.updateTable)
router.delete('/:id_restaurant/tables/:id_table', isUserAuthenticated, checkUserPermission, TableService.deleteTable)

module.exports = router