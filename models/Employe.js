const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { Schema } = mongoose

const employeSchema = new Schema({
    id_restaurant : String,
    nom : String,
    email : String,
    mot_de_passe : String,
    role : String
})

employeSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}

employeSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

employeSchema.methods.toJSON = function() {
    const employe = this
    const employeObject = employe.toObject()
    delete employeObject.mot_de_passe
    return employeObject
}

const Employe = mongoose.model('Employe', employeSchema)

module.exports = Employe