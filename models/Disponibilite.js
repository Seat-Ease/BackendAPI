const mongoose = require('mongoose')
const Restaurant = require('./Restaurants')
const { Schema } = mongoose

const disponibiliteSchema = new Schema({
    id_restaurant: String,
    date: Date,
    heure: String,
    reservee: Boolean
})

disponibiliteSchema.post('save', async function (doc) {
    await Restaurant.findByIdAndUpdate(doc.id_restaurant, { $push: { disponibilites: doc._id } });
});

const Disponibilite = mongoose.model('Disponibilite', disponibiliteSchema)

module.exports = Disponibilite