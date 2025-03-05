const express = require('express')
const router = express.Router()
const EmployeService = require('../services/employeService')

router.post('/', EmployeService.createNewEmployee)
router.get('/', EmployeService.getAllEmployees)
router.get('/:id', EmployeService.getSpecificEmployee)
router.put('/:id', EmployeService.updateEmploye)
router.delete('/:id', EmployeService.deleteEmployee)

module.exports = router