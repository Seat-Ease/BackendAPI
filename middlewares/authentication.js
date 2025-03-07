const Employe = require('../models/Employe')
const jwt = require('jwt-simple')

const isUserAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.auth_token 
        if (!token) {
            return res.status(401).json({ message: 'Token manquant' })
        }

        let decoded
        try {
            decoded = jwt.decode(token, getTokenSecret()) 
        } catch (err) {
            return res.status(401).json({ message: 'Token invalide' })
        }

        const currentTimestamp = Math.floor(Date.now() / 1000) 
        if (decoded.exp && decoded.exp < currentTimestamp) {
            return res.status(401).json({ message: 'Votre token a expiré. Veuillez vous reconnecter' })
        }

        const employe = await Employe.findById(decoded.iss)
        if (!employe) {
            return res.status(404).json({ message: 'Employé associé au token non trouvé' })
        }

        req.employe = employe 
        next() 
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur' })
    }
}

const getTokenSecret = () => {
    return process.env.TOKEN_SECRET || 'SEATEASE_TOKEN_SECRET'
}

const retrieveToken = req => {
    return (req.headers['authorization'] || req.headers['Authorization'] || '').replace('Bearer ', '')
}

module.exports = { isUserAuthenticated, getTokenSecret, retrieveToken }