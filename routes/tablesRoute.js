const express = require('express')
const router = express.Router()
const { checkUserPermission, isIdValid } = require('../middlewares/request')
const { isUserAuthenticated } = require('../middlewares/authentication')
const TableService = require('../services/tableService')

router.post('/', isUserAuthenticated, checkUserPermission, TableService.createTable)
router.put('/:id', isIdValid, isUserAuthenticated, checkUserPermission, TableService.updateTable)
router.delete('/:id', isIdValid, isUserAuthenticated, checkUserPermission, TableService.deleteTable)

module.exports = router