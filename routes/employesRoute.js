const express = require('express')
const router = express.Router()
const EmployeService = require('../services/employeService')
const { isIdValid, checkUserPermission } = require('../middlewares/request')
const { isUserAuthenticated } = require('../middlewares/authentication')

router.post('/', isUserAuthenticated, checkUserPermission, EmployeService.createNewEmployee)
router.get('/', isUserAuthenticated, EmployeService.getAllEmployees)
router.get('/:id', isIdValid, isUserAuthenticated, EmployeService.getSpecificEmployee)
router.put('/:id', isIdValid, isUserAuthenticated, EmployeService.updateEmploye)
router.delete('/:id', isIdValid, isUserAuthenticated, checkUserPermission, EmployeService.deleteEmployee)

module.exports = router