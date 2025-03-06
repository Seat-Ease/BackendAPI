const mongoose = require('mongoose')

function isIdValid(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'ID invalide' })
    return next()
}

module.exports = isIdValid;