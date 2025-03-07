const Employe = require('../models/Employe')
const Restaurant = require('../models/Restaurants')
const { getTokenSecret } = require('../middlewares/authentication')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt')

class AuthService {
    static async login(req, res) {
        try {
            const { email, mot_de_passe } = req.body
            
            if (!email || !mot_de_passe) return res.status(400).json({ message: "Email et mot de passe sont requis" })
            const employe = await Employe.findOne({ email })
            
            if (!employe || !bcrypt.compareSync(mot_de_passe, employe.mot_de_passe)) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
            }

            const restaurant = await Restaurant.findOne({ _id: employe.id_restaurant })
        
            const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day expiration
            const token = jwt.encode({ iss: employe.id, exp: expires }, getTokenSecret())
        
            res.cookie('auth_token', token, {
                httpOnly: true, 
                secure: true,   
                sameSite: 'Strict', 
                maxAge: 24 * 60 * 60 * 1000
            })
        
            res.status(200).json({
                employe: {
                    nom: employe.nom,
                    email: employe.email,
                    telephone: employe.telephone,
                    role: employe.role
                },
                restaurant
            })
        } catch (error) {
            return res.status(500).json({ message: 'Erreur serveur' })
        }
    }
    static async logout(req, res) {
        try {
            res.clearCookie('auth_token', {
                httpOnly: true,
                secure: true, 
                sameSite: 'Strict'
            }) 
            return res.status(200).json({ message: 'Déconnexion réussie' })
        } catch (error) {
            return res.status(500).json({ message: 'Erreur serveur' })
        }
    }
}

module.exports = AuthService