const mongoose = require('mongoose')
const Restaurant = require('./Restaurants')
const bcrypt = require('bcrypt')
const { Schema } = mongoose

const employeSchema = new Schema({
    id_restaurant : String,
    nom : String,
    email : String,
    mot_de_passe : String,
    telephone: String,
    role : String,
    token: String
})

employeSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}

employeSchema.methods.toJSON = function() {
    const employe = this
    const employeObject = employe.toObject()
    delete employeObject.mot_de_passe
    return employeObject
}

employeSchema.post('save', async function (doc) {
    await Restaurant.findByIdAndUpdate(doc.id_restaurant, { $push: { employes: doc._id } });
});

const Employe = mongoose.model('Employe', employeSchema)

module.exports = Employe