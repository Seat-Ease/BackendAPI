const mongoose = require('mongoose')
const Restaurant = require('../models/Restaurants')
const Employe = require('../models/Employe')

function isIdValid(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'ID invalide' })
    return next()
}

async function restaurantAccountCreationMiddleware(req, res, next) {
    try {
        const { info_restaurant, info_admin } = req.body;
        if (!info_restaurant || !info_admin) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" });
        if (!info_restaurant.nom || !info_restaurant.courriel || !info_restaurant.adresse || !info_restaurant.telephone) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" });
        if (!info_admin.nom || !info_admin.email || !info_admin.mot_de_passe || !info_admin.telephone) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" });
        const restaurantExiste = await Restaurant.exists({ courriel: info_restaurant.courriel });
        if (restaurantExiste) {
            return res.status(400).json({ message: "Un compte avec ce courriel de restaurant existe déjà" });
        }
        const adminExiste = await Employe.exists({ email: info_admin.email });
        if (adminExiste) {
            return res.status(400).json({ message: "Un compte avec cet email d'administrateur existe déjà" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Erreur serveur lors de la validation" });
    }
}

module.exports = { isIdValid, restaurantAccountCreationMiddleware };