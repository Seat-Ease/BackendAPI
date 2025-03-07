const mongoose = require('mongoose')
const { Schema } = mongoose

const disponibiliteSchema = new Schema({
    id_restaurant: String,
    date: Date,
    heure: String,
    reservee: Boolean
})

const Disponibilite = mongoose.model('Disponibilite', disponibiliteSchema)

module.exports = Disponibilite