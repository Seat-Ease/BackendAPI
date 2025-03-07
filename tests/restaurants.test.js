const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Employe = require('../models/Employe');
const Restaurant = require('../models/Restaurants');

describe('Tests des endpoints /restaurants', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await Employe.deleteMany({});
        await Restaurant.deleteMany({});
        await mongoose.connection.close();
    });

    let restaurantId;
    let adminToken;
    let regularToken;
    let adminInfo;

    /**
     * Test de création d'un restaurant avec un admin obligatoire
     */
    test('POST /restaurants - Créer un restaurant avec un admin', async () => {
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
                    telephone: '987-654-3210',
                }
            })
            .expect(201);
        
        expect(response.body).toHaveProperty('restaurant');
        expect(response.body.restaurant.nom).toBe('Restaurant Test');
        expect(response.body).toHaveProperty('admin');
        expect(response.body.admin.nom).toBe('Admin Test');
        restaurantId = response.body.restaurant._id;
        adminInfo = response.body.admin
    });

    /**
     * Test de création sans admin (doit échouer)
     */
    test("POST /restaurants - Erreur si aucun admin n'est fourni", async () => {
        const response = await request(app)
            .post('/restaurants')
            .send({
                info_restaurant: {
                    nom: 'Restaurant Test',
                    courriel: 'info@restaurantTest.ca',
                    adresse: '123 Rue Test',
                    telephone: '123-456-7890'
                }
            })
            .expect(400);
        
        expect(response.body.message).toBe('Tous les champs requis doivent être fournis');
    });

    /**
     * Test de création avec un courriel de restaurant déjà utilisé
     */
    test('POST /restaurants - Erreur si le courriel du restaurant est déjà utilisé', async () => {
        const response = await request(app)
            .post('/restaurants')
            .send({
                info_restaurant: {
                    nom: 'Restaurant Duplication',
                    courriel: 'info@restaurantTest.ca',
                    adresse: '456 Rue Test',
                    telephone: '555-555-5555'
                },
                info_admin: {
                    nom: 'Admin Duplication',
                    email: 'admin2@restaurantTest.ca',
                    mot_de_passe: 'password123',
                    telephone: '999-999-9999',
                }
            })
            .expect(400);
        
        expect(response.body.message).toBe('Un compte avec ce courriel de restaurant existe déjà');
    });

    /**
     * Test de création avec un courriel d'admin déjà utilisé
     */
    test("POST /restaurants - Erreur si le courriel de l'admin est déjà utilisé", async () => {
        const response = await request(app)
            .post('/restaurants')
            .send({
                info_restaurant: {
                    nom: 'Restaurant Unique',
                    courriel: 'unique@restaurantTest.ca',
                    adresse: '789 Rue Test',
                    telephone: '777-777-7777'
                },
                info_admin: {
                    nom: 'Admin Test',
                    email: 'admin@restaurantTest.ca',
                    mot_de_passe: 'password123',
                    telephone: '123-456-7890',
                }
            })
            .expect(400);
        
        expect(response.body.message).toBe("Un compte avec cet email d'administrateur existe déjà");
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
     * Test de mise à jour d'un restaurant par un admin
     */
    test('PUT /restaurants/:id - Mettre à jour un restaurant par un admin', async () => {
        // Connexion avec l'admin
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@restaurantTest.ca',
                mot_de_passe: 'password123'
            })
            .expect(200);
        adminToken = loginResponse.headers['set-cookie'];
        const response = await request(app)
            .put(`/restaurants/${restaurantId}`)
            .set('Cookie', adminToken)
            .send({
                nom: 'Restaurant Modifié'
            })
            .expect(200);
        
        expect(response.body.nom).toBe('Restaurant Modifié');
    });

    /**
     * Test de mise à jour d'un restaurant par un regular
     */
    test('PUT /restaurants/:id - Mettre à jour un restaurant par un regular', async () => {
        // Créer un employé régulier
        const regularResponse = await request(app)
            .post('/employes')
            .set('Cookie', adminToken)
            .send({
                nom: 'Employé Test',
                email: 'employe@test.com',
                mot_de_passe: 'password123',
                role: 'regular',
                id_restaurant: restaurantId
            })
            .expect(201);
        
        // Connexion avec l'employé régulier
        const loginRegularResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'employe@test.com',
                mot_de_passe: 'password123'
            })
            .expect(200);
        regularToken = loginRegularResponse.headers['set-cookie'];
        const response = await request(app)
            .put(`/restaurants/${restaurantId}`)
            .set('Cookie', regularToken)
            .send({
                nom: 'Tentative Modification'
            })
            .expect(401);
        
        expect(response.body.message).toBe("Vous n'êtes pas autorisé à faire cette action");
    });

    /**
     * Test de mise à jour avec un ID inexistant par un admin
     */
    test("PUT /restaurants/:id - Erreur si le restaurant n'existe pas (par un admin)", async () => {
        const response = await request(app)
            .put('/restaurants/660000000000000000000000')
            .set('Cookie', adminToken)
            .send({ nom: 'Nom Test' })
            .expect(404);
        
        expect(response.body.message).toBe('Restaurant non trouvé');
    });

    /**
     * Test de suppression d'un restaurant par un admin
     */
    test('DELETE /restaurants/:id - Supprimer un restaurant par un admin', async () => {
        await request(app)
            .delete(`/restaurants/${restaurantId}`)
            .set('Cookie', adminToken)
            .expect(200);
        
        const checkResponse = await request(app)
            .get(`/restaurants/${restaurantId}`)
            .expect(404);
        
        expect(checkResponse.body.message).toBe('Restaurant non trouvé');
    });

    /**
     * Test de suppression avec un ID inexistant par un admin
     */
    test("DELETE /restaurants/:id - Erreur si le restaurant n'existe pas (par un admin)", async () => {
        const response = await request(app)
            .delete('/restaurants/660000000000000000000000')
            .set('Cookie', adminToken)
            .expect(404);
        
        expect(response.body.message).toBe('Restaurant non trouvé');
    });

    /**
     * Test de suppression d'un restaurant par un regular
     */
    test('DELETE /restaurants/:id - Un employé régulier ne peut pas supprimer un restaurant', async () => {
        const response = await request(app)
            .delete(`/restaurants/${restaurantId}`)
            .set('Cookie', regularToken)
            .expect(401);
        
        expect(response.body.message).toBe("Vous n'êtes pas autorisé à faire cette action");
    });
});
