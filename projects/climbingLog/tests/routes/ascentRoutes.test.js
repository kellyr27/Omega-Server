const request = require('supertest');
const mongoose = require('mongoose');


describe('Ascent Routes', () => {
    beforeEach(async () => {
        // Clear the database before each test
        await testDb.dropDatabase()
    });

    test('Should create a new ascent with a new route', async () => {

        const [testUser, token] = await testHelpers.createTestUser();

        // Create a new ascent
        const ascent = {
            route: {
                name: 'Test Route',
                grade: 17,
                colour: 'red',
            },
            date: '2021-01-01',
            tickType: 'flash',
            notes: 'Test notes',
        }

        // Send a POST request to the server from the user
        const response = await request(server)
            .post('/climbinglog/api/ascents')
            .set('Authorization', `Bearer ${token}`)
            .send(ascent)
            .expect(201);

    });

    test('Should create a new ascent with an existing route', async () => {

        const [testUser, token] = await testHelpers.createTestUser();

        // Create a route and save it to the database
        const route = await testHelpers.createTestRoute(testUser);
        
        // Create a new ascent with this existing route
        const ascent = {
            route: route,
            date: '2021-01-01',
            tickType: 'flash',
            notes: 'Test notes',
        }

        // Send a POST request to the server from the user
        const response = await request(server)
            .post('/climbinglog/api/ascents')
            .set('Authorization', `Bearer ${token}`)
            .send(ascent)
            .expect(201);

        // Check that the response contains the correct ascent
        expect(response.body.route._id).toBe(route._id.toString());

    })

    test('Should not create a new ascent as the ascent schema is not valid', async () => {
        const [testUser, token] = await testHelpers.createTestUser();
        
        // Create a new ascent with an invalid schema
        const invalidAscent = {
            route: {
                name: 'Test Route',
                grade: '',
                colour: '',
            },
            date: '2021-01-01',
            tickType: 'flash',
        }

        // Send a POST request to the server from the user
        const response = await request(server)
            .post('/climbinglog/api/ascents')
            .set('Authorization', `Bearer ${token}`)
            .send(invalidAscent)
            .expect(400);

    })

    test('Should get all ascents for that user', async () => {
        
        const [user, token, routes, ascents] = await testHelpers.createTestUserWithAscents();

        // Create two other users with routes and ascents to ensure that the response only contains the ascents for the user
        await testHelpers.createTestUserWithAscents();
        await testHelpers.createTestUserWithAscents();

        // Send a GET request to the server from the user
        const response = await request(server)
            .get('/climbinglog/api/ascents')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        // Check that the response contains the correct ascents
        expect(response.body.length).toBe(ascents.length);
        
    })

    test('Should get an ascent by id', async () => {
        const [user, token, routes, ascents] = await testHelpers.createTestUserWithAscents();

        // Create two other users with routes and ascents to ensure that the response only contains the ascents for the user
        await testHelpers.createTestUserWithAscents();
        await testHelpers.createTestUserWithAscents();

        // Select a random ascent
        const ascent = ascents[Math.floor(Math.random() * ascents.length)];

        // Send a GET request to the server from the user
        const response = await request(server)
            .get(`/climbinglog/api/ascents/${ascent._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        // Check that the response contains the correct ascent
        expect(response.body._id).toBe(ascent._id.toString());
    })

    test('Should not get an ascent by id as the user does not have permission', async () => {
        // Create two users with routes and ascents
        const [user1, token1, routes1, ascents1] = await testHelpers.createTestUserWithAscents();
        const [user2, token2, routes2, ascents2] = await testHelpers.createTestUserWithAscents();

        // Select a random ascent from user1
        const ascent = ascents1[Math.floor(Math.random() * ascents1.length)];

        // Send a GET request to the server from user2
        const response = await request(server)
            .get(`/climbinglog/api/ascents/${ascent._id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(403);
    })

    test('Should update an ascent', async () => {
        // Create a user with routes and ascents
        const [user, token, routes, ascents] = await testHelpers.createTestUserWithAscents();

        // Select a random ascent
        const ascent = ascents[Math.floor(Math.random() * ascents.length)];

        // Create a new route
        const newRoute = await testHelpers.createTestRoute(user);

        // Update the ascent with the new route
        const updatedAscent = {
            route: newRoute,
            date: '2021-01-01',
            tickType: 'flash',
            notes: 'Test notes',
        }

        // Send a PUT request to the server from the user
        const response = await request(server)
            .put(`/climbinglog/api/ascents/${ascent._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedAscent)
            .expect(200);

        // Check that the response contains the correct ascent
        expect(response.body.route._id).toBe(newRoute._id.toString());

    })

    test('Should not update an ascent as the ascent schema is not valid', async () => {
        // Create a user with routes and ascents
        const [user, token, routes, ascents] = await testHelpers.createTestUserWithAscents();

        // Select a random ascent
        const ascent = ascents[Math.floor(Math.random() * ascents.length)];

        // Create a new route
        const newRoute = await testHelpers.createTestRoute(user);

        // Update the ascent with the new route with an invalid tickType
        const updatedAscent = {
            route: newRoute,
            date: '2021-01-01',
            tickType: 'onsight',
        }

        // Send a PUT request to the server from the user
        const response = await request(server)
            .put(`/climbinglog/api/ascents/${ascent._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedAscent)
            .expect(400);
    })

    test('Should not update an ascent as the user does not have permission', async () => {
        // Create two users with routes and ascents
        const [user1, token1, routes1, ascents1] = await testHelpers.createTestUserWithAscents();
        const [user2, token2, routes2, ascents2] = await testHelpers.createTestUserWithAscents();

        // Select a random ascent from user1
        const ascent = ascents1[Math.floor(Math.random() * ascents1.length)]

        // Create a new route
        const newRoute = await testHelpers.createTestRoute(user1);

        // Update the ascent with the new route
        const updatedAscent = {
            route: newRoute,
            date: '2021-01-01',
            tickType: 'flash',
            notes: 'Test notes',
        }

        // Send a PUT request to the server from user2
        const response = await request(server)
            .put(`/climbinglog/api/ascents/${ascent._id}`)
            .set('Authorization', `Bearer ${token2}`)
            .send(updatedAscent)
            .expect(403);
        
    })

    test('Should not update an ascent as the ascent does not exist', async () => {
        // Create a user with routes and ascents
        const [user, token, routes, ascents] = await testHelpers.createTestUserWithAscents();

        // Create a new route
        const newRoute = await testHelpers.createTestRoute(user);

        // Update the ascent with the new route
        const updatedAscent = {
            route: newRoute,
            date: '2021-01-01',
            tickType: 'flash',
            notes: 'Test notes',
        }


        // Send a PUT request to the server from the user
        // NOTE mongoose.Types.ObjectId() generates an id that does not exist in the database
        const response = await request(server)
            .put(`/climbinglog/api/ascents/${new mongoose.Types.ObjectId()}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedAscent)
            .expect(404);
    })

    test('Should delete an ascent', async () => {
        // Create a user with routes and ascentsq
        const [user, token, routes, ascents] = await testHelpers.createTestUserWithAscents();

        // Select a random ascent
        const ascent = ascents[Math.floor(Math.random() * ascents.length)];

        // Send a DELETE request to the server from the user
        const response = await request(server)
            .delete(`/climbinglog/api/ascents/${ascent._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);


    })

    test('Should not delete an ascent as the user does not have permission', async () => {
        // Create two users with routes and ascents
        const [user1, token1, routes1, ascents1] = await testHelpers.createTestUserWithAscents();
        const [user2, token2, routes2, ascents2] = await testHelpers.createTestUserWithAscents();

        // Select a random ascent from user1
        const ascent = ascents1[Math.floor(Math.random() * ascents1.length)]

        // Send a DELETE request to the server from user2
        const response = await request(server)
            .delete(`/climbinglog/api/ascents/${ascent._id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(403);
    })

    test('Should not delete an ascent as the ascent does not exist', async () => {
        // Create a user with routes and ascents
        const [user, token, routes, ascents] = await testHelpers.createTestUserWithAscents();

        // Send a DELETE request to the server from the user
        // NOTE mongoose.Types.ObjectId() generates an id that does not exist in the database
        const response = await request(server)
            .delete(`/climbinglog/api/ascents/${new mongoose.Types.ObjectId()}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    })
});