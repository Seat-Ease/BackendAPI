const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Tests des endpoints /restaurants', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    let restaurantId;

    /**
     * Test de création d'un restaurant
     */
    test('POST /restaurants - Créer un restaurant', async () => {
        const response = await request(app)
            .post('/restaurants')
            .send({
                info_restaurant: {
                    nom: 'Restaurant Test',
                    courriel: 'info@restaurantTest.ca',
                    adresse: '123 Rue Test',
                    telephone: '123-456-7890'
                },
                info_admin: {
                    nom: 'Admin Test',
                    email: 'admin@restaurantTest.ca',
                    mot_de_passe: 'password123',
                    telephone: '123-567-4532'
                }
            })
            .expect(201);
        
        expect(response.body.restaurant).toHaveProperty('_id');
        expect(response.body.restaurant.nom).toBe('Restaurant Test');
        restaurantId = response.body.restaurant._id;
    });

    /**
     * Test de création avec des données manquantes
     */
    test('POST /restaurants - Erreur si des champs requis sont manquants', async () => {
        const response = await request(app)
            .post('/restaurants')
            .send({})
            .expect(400);
        
        expect(response.body.message).toBe('Tous les champs requis doivent être fournis');
    });

    /**
     * Test de récupération de tous les restaurants
     */
    test('GET /restaurants - Récupérer tous les restaurants', async () => {
        const response = await request(app)
            .get('/restaurants')
            .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
    });

    /**
     * Test de récupération d'un restaurant spécifique
     */
    test('GET /restaurants/:id - Récupérer un restaurant par ID', async () => {
        const response = await request(app)
            .get(`/restaurants/${restaurantId}`)
            .expect(200);
        
        expect(response.body).toHaveProperty('_id', restaurantId);
    });

    /**
     * Test de récupération avec un ID invalide
     */
    test("GET /restaurants/:id - Erreur si l'ID est invalide", async () => {
        const response = await request(app)
            .get('/restaurants/invalidID')
            .expect(400);
        
        expect(response.body.message).toBe('ID invalide');
    });

    /**
     * Test de mise à jour d'un restaurant
     */
    test('PUT /restaurants/:id - Mettre à jour un restaurant', async () => {
        const response = await request(app)
            .put(`/restaurants/${restaurantId}`)
            .send({
                nom: 'Restaurant Modifié'
            })
            .expect(200);
        
        expect(response.body.nom).toBe('Restaurant Modifié');
    });

    /**
     * Test de mise à jour avec un ID inexistant
     */
    test("PUT /restaurants/:id - Erreur si le restaurant n'existe pas", async () => {
        const response = await request(app)
            .put('/restaurants/660000000000000000000000')
            .send({ nom: 'Nom Test' })
            .expect(404);
        
        expect(response.body.message).toBe('Restaurant non trouvé');
    });

    /**
     * Test de suppression d'un restaurant
     */
    test('DELETE /restaurants/:id - Supprimer un restaurant', async () => {
        await request(app)
            .delete(`/restaurants/${restaurantId}`)
            .expect(200);
        
        const checkResponse = await request(app)
            .get(`/restaurants/${restaurantId}`)
            .expect(404);
        
        expect(checkResponse.body.message).toBe('Restaurant non trouvé');
    });

    /**
     * Test de suppression avec un ID inexistant
     */
    test("DELETE /restaurants/:id - Erreur si le restaurant n'existe pas", async () => {
        const response = await request(app)
            .delete('/restaurants/660000000000000000000000')
            .expect(404);
        
        expect(response.body.message).toBe('Restaurant non trouvé');
    });
});
