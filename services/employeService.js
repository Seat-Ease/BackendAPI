const mongoose = require('mongoose')
const Employe = require('../models/Employe')
const Restaurant = require('../models/Restaurants')

class EmployeService {
    static async createNewEmployee(req, res) {
        try {
            const { nom, email, mot_de_passe, role, telephone, id_restaurant } = req.body
            const restaurant = await Restaurant.findById(id_restaurant)
            if (!restaurant) return res.status(404).json({ message: "Restaurant non trouvé" })
            if (!nom || !email || !mot_de_passe || !role || !id_restaurant) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" })
            const newEmploye = new Employe()
            newEmploye.nom = nom
            newEmploye.email = email
            newEmploye.mot_de_passe = newEmploye.generateHash(mot_de_passe)
            newEmploye.telephone = telephone
            newEmploye.id_restaurant = id_restaurant
            const employe = await Employe.insertOne(newEmploye)
            return res.status(201).json(employe)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
    
    static async getAllEmployees(req, res) {
        try {
            const employees = await Employe.find({});
            return res.status(200).json(employees)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async getSpecificEmployee(req, res) {
        try {
            const employe = await Employe.findById(req.params.id)
            if (!employe) return res.status(404).json({ message: "Employé non trouvé" })
            return res.status(200).json(employe)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async updateEmploye(req, res) {
        try {
            const employe = await Employe.findByIdAndUpdate(req.params.id, req.body, { new: true })
            if (!employe) return res.status(404).json({ message: "Employé non trouvé" })
            return res.status(200).json(employe)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async deleteEmployee(req, res) {
        try {
            const employe = await Employe.findByIdAndDelete(req.params.id)
            if (!employe) return res.status(404).json({ message: "Employé non trouvé" })
            return res.status(200).json({ message: "Employé supprimé avec succès" })
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
}

module.exports = EmployeService