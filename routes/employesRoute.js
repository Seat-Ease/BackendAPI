const express = require('express')
const router = express.Router()
const EmployeService = require('../services/employeService')
const isIdValid = require('../middlewares/id')

router.post('/', EmployeService.createNewEmployee)
router.get('/', EmployeService.getAllEmployees)
router.get('/:id', isIdValid, EmployeService.getSpecificEmployee)
router.put('/:id', isIdValid, EmployeService.updateEmploye)
router.delete('/:id', isIdValid, EmployeService.deleteEmployee)

module.exports = router