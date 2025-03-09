const express = require('express')
const router = express.Router()
const RestaurantService = require('../services/restaurantService')
const TableService = require('../services/tableService')
const DisponibiliteService = require('../services/disponibiliteService')
const EmployeService = require('../services/employeService')
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

router.post('/:id_restaurant/disponibilites', isUserAuthenticated, checkUserPermission, DisponibiliteService.createAvailability)
router.get('/:id_restaurant/disponibilites', DisponibiliteService.getRestaurantAvailabilities)
router.get('/:id_restaurant/disponibilites/:id_disponibilites', DisponibiliteService.getSpecificRestaurantAvailability)
router.put('/:id_restaurant/disponibilites/:id_disponibilites', isUserAuthenticated, checkUserPermission, DisponibiliteService.updateAvailability)
router.delete('/:id_restaurant/disponibilites/:id_disponibilites', isUserAuthenticated, checkUserPermission, DisponibiliteService.deleteAvailability)

router.post('/:id_restaurant/employes', isUserAuthenticated, checkUserPermission, EmployeService.createNewEmployee)
router.get('/:id_restaurant/employes', EmployeService.getAllEmployees)
router.get('/:id_restaurant/employes/:id_employes', EmployeService.getSpecificEmployee)
router.put('/:id_restaurant/employes/:id_employes', isUserAuthenticated, EmployeService.updateEmploye)
router.delete('/:id_restaurant/employes/:id_employes', isUserAuthenticated, checkUserPermission, EmployeService.deleteEmployee)

module.exports = router