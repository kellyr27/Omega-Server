const request = require('supertest');
const mongoose = require('mongoose');

describe('Authenticate Middleware', () => {

    beforeEach(async () => {
        // Clear the database before each test
        await testDb.dropDatabase()
    });

    it('should pass authentication with valid token', async () => {
        const [testUser, token] = await testHelpers.createTestUser();
        
        const res = await request(server)
            .get('/climbinglog/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
    });

    it('should fail authentication with invalid token', async () => {
        const [testUser, token] = await testHelpers.createTestUser();
        
        const res = await request(server)
            .get('/climbinglog/protected')
            .set('Authorization', 'Bearer invalidtoken');

        expect(res.statusCode).toEqual(401);
    });
});