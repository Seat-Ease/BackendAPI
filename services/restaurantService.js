const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurants')
const Employe = require('../models/Employe')
class RestaurantService {
    static async createRestaurantAccount(req, res) {
        try {
            const { info_restaurant, info_admin } = req.body;
            if (!info_restaurant || !info_admin) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" })
            if (!info_restaurant.nom || !info_restaurant.courriel || !info_restaurant.adresse || !info_restaurant.telephone) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" })
            if (!info_admin.nom || !info_admin.email || !info_admin.mot_de_passe || !info_admin.telephone) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" })
            const resultRestaurant = await Restaurant.insertOne(info_restaurant)
            const newEmploye = new Employe()
            newEmploye.nom =  info_admin.nom
            newEmploye.email= info_admin.email
            newEmploye.mot_de_passe = newEmploye.generateHash(info_admin.mot_de_passe)
            newEmploye.telephone = info_admin.telephone
            newEmploye.id_restaurant = resultRestaurant._id
            newEmploye.role = 'admin'
            const resultAdmin = await Employe.insertOne(newEmploye)
            console.log(resultAdmin)
            const result = { restaurant: resultRestaurant, admin: resultAdmin }
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async getRestaurants(req, res) {
        try {
            const restaurants = await Restaurant.find({});
            return res.status(200).json(restaurants)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async getSpecificRestaurant(req, res) {
        try {
            const restaurant = await Restaurant.findById(req.params.id)
            if (!restaurant) return res.status(404).json({ message: "Restaurant non trouvé" })
            return res.status(200).json(restaurant)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async updateRestaurant(req, res) {
        try {
            const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true })
            if (!restaurant) return res.status(404).json({ message: "Restaurant non trouvé" })
            return res.status(200).json(restaurant)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async deleteRestaurant(req, res) {
        try {
            const restaurant = await Restaurant.findByIdAndDelete(req.params.id)
            if (!restaurant) return res.status(404).json({ message: "Restaurant non trouvé" })
            return res.status(200).json({ message: "Restaurant supprimé avec succès" })
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
}

module.exports = RestaurantService