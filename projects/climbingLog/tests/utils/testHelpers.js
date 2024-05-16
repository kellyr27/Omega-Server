const User = require('../../models/userModel');
const Route = require('../../models/routeModel');
const Ascent = require('../../models/ascentModel');
const Area = require('../../models/areaModel');

const createTestUser = async () => {
    // Create a test user with a random username to avoid conflicts
    const testUser = new User({
        username: `Test User ${Math.floor(Math.random() * 100000)}`,
        password: 'password',
    });

    await testUser.save();
    const token = testUser.generateAuthToken();

    return [testUser, token];
}

const createTestArea = async () => {
	// Create a test area with a random name to avoid conflicts
	const area = new Area({
		name: `Test Area ${Math.floor(Math.random() * 100000)}`,
	});
	await area.save();

	return area;
}

const createTestRouteWithExistingArea = async (user, area) => {

    // Create a test route with a random name to avoid conflicts
    const route = new Route({
        name: `Test Route ${Math.floor(Math.random() * 100000)}`,
        grade: 17,
        colour: 'red',
        user: user._id,
		area: area._id,
    });
    await route.save();

    return route;
}

const createTestRouteWithoutExistingArea = async (user) => {
	
	const area = new Area({
		name: `Test Area ${Math.floor(Math.random() * 100000)}`,
	});

	// Create a test route with a random name to avoid conflicts
	const route = new Route({
		name: `Test Route ${Math.floor(Math.random() * 100000)}`,
		grade: 17,
		colour: 'red',
		user: user._id,
		area: area._id,
	});
	await route.save();

	return route;
}

const createTestAscentWithExistingRoute = async (user, route) => {

    const ascent = new Ascent({
        user: user._id,
        route: route._id,
        date: '2021-01-01',
        tickType: 'flash',
        notes: 'Test notes',
    });
    await ascent.save();

    return ascent;
}

const createTestAscentWithoutExistingRoute = async (user) => {
    
	const route = createTestRouteWithoutExistingArea(user);
	
    const ascent = new Ascent({
        user: user._id,
        route: route._id,
        date: '2021-01-01',
        tickType: 'flash',
        notes: 'Test notes',
    });
    await ascent.save();

    return ascent;
}


const createTestUserWithAscents = async () => {
    const [user, token] = await createTestUser();

	// Create two test areas
	const area1 = await createTestArea();
	const area2 = await createTestArea();

    // Generate a random number of routes between 1 and 5
    const numRoutes = Math.floor(Math.random() * 5) + 1;
    const routes = await Promise.all(Array(numRoutes).fill().map(async () => {
		// Choose ranmly either test area1 or test area2
		if (Math.random() < 0.5) {
			return createTestRouteWithExistingArea(user, area1)
		} else {
			return createTestRouteWithExistingArea(user, area2)
		}
	}))

    const ascents = [];
    for (const route of routes) {
        const numAscents = Math.floor(Math.random() * 5) + 1;
        const routeAscents = await Promise.all(Array(numAscents).fill().map(async () => createTestAscentWithExistingRoute(user, route)));
        ascents.push(...routeAscents);
    }

    return [user, token, routes, ascents];
}

const createMockDatabase = async () => {
    // Create 3 test users
    const [user1, token1, routes1, ascents1] = await createTestUserWithAscents();
    const [user2, token2, routes2, ascents2] = await createTestUserWithAscents();
    const [user3, token3, routes3, ascents3] = await createTestUserWithAscents();


    return [user1, token1, routes1, ascents1]
}

module.exports = { 
    createTestUser, 
    createTestArea,
	createTestRouteWithExistingArea,
	createTestRouteWithoutExistingArea,
	createTestAscentWithExistingRoute,
	createTestAscentWithoutExistingRoute,
    createTestUserWithAscents
};