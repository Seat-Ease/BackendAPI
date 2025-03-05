const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Employe = require('../models/Employe');
const Restaurant = require('../models/Restaurants');

describe('Tests des endpoints /employes', () => {
    let restaurantId;
    let employeId;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Créer un restaurant pour lier les employés
        const restaurant = await Restaurant.collection.insertOne({
            nom: 'Restaurant Test',
            adresse: '123 Rue Test',
            telephone: '123-456-7890',
        });
        restaurantId = restaurant.insertedId;
    });

    afterAll(async () => {
        await Employe.deleteMany({});
        await Restaurant.deleteMany({});
        await mongoose.connection.close();
    });

    /**
     * 🔹 Test de création d'un employé
     */
    test('POST /employes - Créer un employé', async () => {
        const response = await request(app)
            .post('/employes')
            .send({
                nom: 'Employé Test',
                email: 'employe@test.com',
                mot_de_passe: 'password123',
                role: 'serveur',
                id_restaurant: restaurantId
            })
            .expect(201);
        
        expect(response.body).toHaveProperty('_id');
        expect(response.body.nom).toBe('Employé Test');
        expect(response.body).not.toHaveProperty('mot_de_passe'); // Vérifier que le mot de passe n'est pas retourné
        employeId = response.body._id;
    });

    /**
     * 🔹 Test de mise à jour d'un employé
     */
    test('PUT /employes/:id - Modifier un employé', async () => {
        const response = await request(app)
            .put(`/employes/${employeId}`)
            .send({ nom: 'Employé Modifié' })
            .expect(200);
        
        expect(response.body.nom).toBe('Employé Modifié');
    });

    /**
     * 🔹 Test de suppression d'un employé
     */
    test('DELETE /employes/:id - Supprimer un employé', async () => {
        await request(app)
            .delete(`/employes/${employeId}`)
            .expect(200);
        
        const checkResponse = await request(app)
            .get(`/employes/${employeId}`)
            .expect(404);
        
        expect(checkResponse.body.message).toBe('Employé non trouvé');
    });

    /**
     * 🔹 Test de récupération d'un employé spécifique
     */
    test('GET /employes/:id - Récupérer un employé sans son mot de passe', async () => {
        const response = await request(app)
            .post('/employes')
            .send({
                nom: 'Employé Test 2',
                email: 'employe2@test.com',
                mot_de_passe: 'password123',
                role: 'serveur',
                id_restaurant: restaurantId
            })
            .expect(201);
        
        const employeId2 = response.body._id;

        const getResponse = await request(app)
            .get(`/employes/${employeId2}`)
            .expect(200);
        
        expect(getResponse.body).not.toHaveProperty('mot_de_passe');
    });

    /**
     * 🔹 Test de liaison entre un employé et un restaurant
     */
    test("POST /employes - Vérifier que l'employé est bien lié à un restaurant", async () => {
        const response = await request(app)
            .post('/employes')
            .send({
                nom: 'Employé Restaurant',
                email: 'employe.restaurant@test.com',
                mot_de_passe: 'password123',
                role: 'serveur',
                id_restaurant: restaurantId
            })
            .expect(201);
        
        expect(response.body.id_restaurant).toBe(restaurantId.toString());
    });
});
