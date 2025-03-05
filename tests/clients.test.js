const request = require('supertest');
const app = require('../app'); 
const mongoose = require('mongoose');
const Client = require('../models/Client');

describe('Tests des endpoints /clients', () => {
    let clientId;

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await Client.deleteMany({});
        await mongoose.connection.close();
    });

    /**
     * Test de création d'un client
     */
    test('POST /clients - Créer un client', async () => {
        const response = await request(app)
            .post('/clients')
            .send({
                nom: 'Client Test',
                email: 'client@test.com',
                telephone: '123-456-7890'
            })
            .expect(201);
        
        expect(response.body).toHaveProperty('_id');
        expect(response.body.nom).toBe('Client Test');
        clientId = response.body._id;
    });

    /**
     * Test de création avec des champs manquants
     */
    test('POST /clients - Erreur si des champs requis sont manquants', async () => {
        const response = await request(app)
            .post('/clients')
            .send({ nom: 'Client Incomplet' })
            .expect(400);
        
        expect(response.body.message).toBe('Tous les champs requis doivent être fournis');
    });

    /**
     * Test de récupération de tous les clients
     */
    test('GET /clients - Récupérer tous les clients', async () => {
        const response = await request(app)
            .get('/clients')
            .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
    });

    /**
     * Test de récupération d'un client spécifique
     */
    test("GET /clients/:id - Récupérer un client par ID", async () => {
        const response = await request(app)
            .get(`/clients/${clientId}`)
            .expect(200);
        
        expect(response.body).toHaveProperty('_id', clientId);
    });

    /**
     * Test de récupération d'un client inexistant
     */
    test("GET /clients/:id - Erreur si le client n'existe pas", async () => {
        const response = await request(app)
            .get('/clients/660000000000000000000000')
            .expect(404);
        
        expect(response.body.message).toBe('Client non trouvé');
    });

    /**
     * Test de mise à jour d'un client
     */
    test('PUT /clients/:id - Modifier un client', async () => {
        const response = await request(app)
            .put(`/clients/${clientId}`)
            .send({ nom: 'Client Modifié' })
            .expect(200);
        
        expect(response.body.nom).toBe('Client Modifié');
    });

    /**
     * Test de mise à jour d'un client inexistant
     */
    test("PUT /clients/:id - Erreur si le client n'existe pas", async () => {
        const response = await request(app)
            .put('/clients/660000000000000000000000')
            .send({ nom: 'Client Inexistant' })
            .expect(404);
        
        expect(response.body.message).toBe('Client non trouvé');
    });

    /**
     * Test de suppression d'un client
     */
    test('DELETE /clients/:id - Supprimer un client', async () => {
        await request(app)
            .delete(`/clients/${clientId}`)
            .expect(200);
        
        const checkResponse = await request(app)
            .get(`/clients/${clientId}`)
            .expect(404);
        
        expect(checkResponse.body.message).toBe('Client non trouvé');
    });

    /**
     * Test de suppression d'un client inexistant
     */
    test("DELETE /clients/:id - Erreur si le client n'existe pas", async () => {
        const response = await request(app)
            .delete('/clients/660000000000000000000000')
            .expect(404);
        
        expect(response.body.message).toBe('Client non trouvé');
    });
});
