const express = require('express')
const router = express.Router()
const { checkUserPermission } = require('../middlewares/request')
const { isUserAuthenticated } = require('../middlewares/authentication')

router.post('/', )
router.put('/:id', )
router.delete('/:id', )

module.exports = router