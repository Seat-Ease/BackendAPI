const mongoose = require('mongoose');
const { Schema } = mongoose

const restaurantSchema = new Schema({
    nom : String,
    courriel : String,
    adresse : String,
    telephone : String,
    disponibilites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Disponibilite' }],
    reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }],
    employes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employe' }],
    tables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Table' }]
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

module.exports = Restaurant