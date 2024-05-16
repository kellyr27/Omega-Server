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

const createTestArea = async (user) => {
	// Create a test area with a random name to avoid conflicts
	const area = new Area({
		name: `Test Area ${Math.floor(Math.random() * 100000)}`,
		user: user._id,
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
	
	// Create a test area with a random name to avoid conflicts
	const area = new Area({
		name: `Test Area ${Math.floor(Math.random() * 100000)}`,
		user: user._id,
	});
	await area.save();

	// Create a test route with a random name to avoid conflicts
	const route = new Route({
		name: `Test Route ${Math.floor(Math.random() * 100000)}`,
		grade: 17,
		colour: 'red',
		user: user._id,
		area: area._id,
	});
	await route.save();

	const populatedRoute = await Route.findById(route._id).populate('area');
	return populatedRoute;
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
	const area1 = await createTestArea(user);
	const area2 = await createTestArea(user);
    // Generate a test routes
	const route1 = await createTestRouteWithExistingArea(user, area1);
	const route2 = await createTestRouteWithExistingArea(user, area2);
	const route3 = await createTestRouteWithExistingArea(user, area2);
	const routes = [route1, route2, route3];
    // Generate test ascents
	const ascent1 = await createTestAscentWithExistingRoute(user, route1);
	const ascent2 = await createTestAscentWithExistingRoute(user, route2);
	const ascent3 = await createTestAscentWithExistingRoute(user, route2);
	const ascent4 = await createTestAscentWithExistingRoute(user, route3);
	const ascent5 = await createTestAscentWithExistingRoute(user, route3);
	const ascent6 = await createTestAscentWithExistingRoute(user, route3);
	const ascents = [ascent1, ascent2, ascent3, ascent4, ascent5, ascent6];
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