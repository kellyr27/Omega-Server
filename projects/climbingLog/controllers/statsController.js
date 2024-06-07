const Ascent = require('../models/ascentModel');
const Route = require('../models/routeModel');
const Area = require('../models/areaModel');
const {findAscent} = require('../services/ascentServices');

exports.getGradePyramid = [
    async (req, res, next) => {
        try {
            // Get all routes for the user and their ascents
            const routes = await Route.find({ user: req.user._id }).populate('ascents')
            // Define the sort order for each tickType
            const sortOrder = {
                'flash': 1,
                'redpoint': 2,
                'hangdog': 3,
                'attempt': 4
            };
            // For each route, sort the ascents by tickType
            routes.forEach(route => {
                route.ascents.sort((a, b) => sortOrder[a.tickType] - sortOrder[b.tickType]);
            });

            const gradePyramid = {}
            routes.forEach(route => {
                // Check that their exists an ascent for the route
                if (route.ascents.length === 0) {
                    return;
                }

                if (!gradePyramid[route.grade]) {
                    gradePyramid[route.grade] = {
                        'flash': 0,
                        'redpoint': 0,
                        'hangdog': 0,
                        'attempt': 0
                    }
                }
                gradePyramid[route.grade][route.ascents[0].tickType] += 1;
            })
            res.status(200).json(gradePyramid);
        } catch (error) {
            next(error)
        }
    }
]

exports.getPerformanceRating = [
    async (req, res, next) => {
        try {

            const POINTS_TICKTYPE = {
                'flash': 5, 
                'redpoint': 4,
                'hangdog': 3,
                'attempt': 1
            }
            
            /**
             * Low - 1 send
             * Medium - 2-4 sends
             * High - 5+ sends
             */
            const POINTS_SCARCITY = {
                'Low': 2,
                'Medium': 1,
                'High': 0
            }

            // Get all routes for the user and their ascents
            const routes = await Route.find({ user: req.user._id }).populate('ascents')

            // For each route, sort the ascents by date
            routes.forEach(route => {
                route.ascents.sort((a, b) => new Date(a.date) - new Date(b.date));
            });

            // For each route, assign points scarcity to the ascent object
            routes.forEach(route => {
                let count = 0;
                route.ascents = route.ascents.map(ascent => {
                    if (ascent.tickType === 'redpoint' || ascent.tickType === 'flash') {
                        count++;
                    }
                    return { 
                        date: ascent.date, 
                        grade: route.grade,
                        tickType: ascent.tickType,
                        pointsScarcity: count < 2 ? 'Low' : count < 5 ? 'Medium' : 'High'
                    };
                });
            });

            // Extract all the ascents into a single array
            const allAscents = routes.flatMap(route => route.ascents);

            const performanceRatings = {}
            allAscents.forEach(ascent => {
                // Convert the date to a string 'YYYY-MM-DD'
                const date = new Date(ascent.date).toISOString().split('T')[0];
                
                // Points calculation
                const points = ascent.grade + POINTS_TICKTYPE[ascent.tickType] + POINTS_SCARCITY[ascent.pointsScarcity];
                
                if (!performanceRatings[date]) {
                    performanceRatings[date] = [points];
                } else {
                    performanceRatings[date].push(points);
                }
            })

            const performanceRatingsFormatted = Object.entries(performanceRatings).reduce((formatted, [key, value]) => {
                const newValue = {
                    numClimbs: value.length,
                    totalPoints: Number((value.reduce((acc, curr) => acc + curr, 0) / value.length).toFixed(2)),
                }
            
                // Add the new key/value pair to the formatted object
                formatted[key] = newValue;
            
                return formatted;
            }, {});

            res.status(200).json(performanceRatingsFormatted);

        } catch (error) {
            next(error)
        }
    }
]

exports.getWeeklyStats = [
    async (req, res, next) => {
        try {
            // Get all ascents for the user
            const ascents = await Ascent.find({ user: req.user._id }).populate('route');

            // For each ascent, assign a week number
            const ascentsWithWeeks = ascents.map(ascent => {
                const date = new Date(ascent.date);
                const week = Math.ceil((date - new Date(2024, 0, 1)) / 604800000);
                
                return {
                    ...ascent.toObject(),
                    week
                }
            });

            // Group the ascents by week
            const ascentsByWeek = ascentsWithWeeks.reduce((obj, ascent) => {
                if (!obj[ascent.week]) {
                    obj[ascent.week] = [];
                }
                obj[ascent.week].push(ascent);
                return obj;
            }, {});

            // For each week, calculate the average grade for flash, redpoint and other ascents
            const weeklyStats = Object.entries(ascentsByWeek).reduce((obj, [key, value]) => {
                const flashGrades = value.filter(ascent => ascent.tickType === 'flash').map(ascent => ascent.route.grade);
                const redpointGrades = value.filter(ascent => ascent.tickType === 'redpoint').map(ascent => ascent.route.grade);
                const otherGrades = value.filter(ascent => ascent.tickType === 'hangdog' || ascent.tickType === 'attempt').map(ascent => ascent.route.grade);

                const avgFlashGrade = flashGrades.length > 0 ? (flashGrades.reduce((acc, curr) => acc + curr, 0) / flashGrades.length).toFixed(2) : null;
                const avgRedpointGrade = redpointGrades.length > 0 ? (redpointGrades.reduce((acc, curr) => acc + curr, 0) / redpointGrades.length).toFixed(2) : null;
                const avgOtherGrade = otherGrades.length > 0 ? (otherGrades.reduce((acc, curr) => acc + curr, 0) / otherGrades.length).toFixed(2) : null;

                obj[key] = {
                    avgFlashGrade,
                    avgRedpointGrade,
                    avgOtherGrade
                }
                return obj;
            }, {});

            res.status(200).json(weeklyStats);
        } catch (error) {
            next(error)
        }
    }
]


// TODO: Move
const tickTypeValues = {
	flash: 4,
	redpoint: 3,
	hangdog: 2,
	attempt: 1
};

exports.getAreaStats = [
	async (req, res, next) => {
		try {

			// Iterate through all the areas
			const areas = await Area.find({ user: req.user._id });

			// For each area, get the number of routes
			const areaStats = await Promise.all(areas.map(async (area) => {

				// Get all routes in that area
				const routes = await Route.find({ user: req.user._id, area: area._id })
					.populate('ascents')
					.populate({
						path: 'ascents',
						populate: {
							path: 'route'
						}
					})

				
				// Order all ascents by tickType and date
				routes.forEach(route => {

					route.ascents.sort((a, b) => {
						if (tickTypeValues[a.tickType] !== tickTypeValues[b.tickType]) {
							return tickTypeValues[b.tickType] - tickTypeValues[a.tickType];
						} else {
							return new Date(a.date) - new Date(b.date);
						}
					});
				});

				
				// For each route, find the best ascent
				const bestAscents = routes.map(route => {
					// Assuming route.ascents is an array of ascents for the route
					if (!route.ascents || route.ascents.length === 0) {
						return null;
					}

					const bestAscent = route.ascents[0];

					// Return the best ascent
					return bestAscent;
				})

				// Find the max Grade for each tickType
				const maxGrades = {}
				for (const tickType of Object.keys(tickTypeValues)) {
					const filteredAscents = bestAscents.filter(ascent => ascent.tickType === tickType);

					if (filteredAscents.length === 0) {
						continue;
					}

					const maxGrade = filteredAscents.reduce((max, ascent) => {
						return ascent.route.grade > max ? ascent.route.grade : max;
					}, 0);

					maxGrades[tickType] = maxGrade;
				}

				// Find the latest 3 climbs for each tickType at the max grade
				const topThreeAscents = {}
				for (const tickType of Object.keys(tickTypeValues)) {
					const filteredAscents = bestAscents.filter(ascent => ascent.tickType === tickType && ascent.route.grade === maxGrades[tickType]);

					if (filteredAscents.length === 0) {
						continue;
					}

					filteredAscents.sort((a, b) => new Date(b.date) - new Date(a.date));

					topThreeAscents[tickType] = filteredAscents.slice(0, 3);
				}

				/** 
				 * Now to get a count of all ascents by grade within the area 
				 * */
				const allAscents = await Ascent.find({ user: req.user._id, route: { $in: routes.map(route => route._id) }})
					.populate({
						path: 'route',
						populate: {
						path: 'area'
						}
					});

				const gradeCounts = allAscents.reduce((obj, ascent) => {
					if (!obj[ascent.route.grade]) {
						obj[ascent.route.grade] = 1;
					} else {
						obj[ascent.route.grade]++;
					}
					return obj;
				}, {});

				const totalAscents = Object.values(gradeCounts).reduce((acc, curr) => acc + curr, 0);

				return {
					area: area,
					topAscents: topThreeAscents,
					gradeCounts: gradeCounts,
					totalAscents: totalAscents
				}
			}))

			// Order the areas by total ascents
			areaStats.sort((a, b) => b.totalAscents - a.totalAscents);

			res.status(200).json(areaStats);

		} catch (error) {
			next(error)
		}
	}
]

exports.getTickTypeStats = [
    async (req, res, next) => {
        try {
            
		// Get all routes in that area
		const routes = await Route.find({ user: req.user._id })
			.populate('ascents')
			.populate({
				path: 'ascents',
				populate: {
					path: 'route'
				}
			})

		// Order all ascents by tickType and date
		routes.forEach(route => {
			route.ascents.sort((a, b) => {
				if (tickTypeValues[a.tickType] !== tickTypeValues[b.tickType]) {
					return tickTypeValues[b.tickType] - tickTypeValues[a.tickType];
				} else {
					return new Date(a.date) - new Date(b.date);
				}
			});
		});

		// For each route, find the best ascent
		const bestAscents = routes.map(route => {
			// Assuming route.ascents is an array of ascents for the route
			if (!route.ascents || route.ascents.length === 0) {
				return null;
			}

			const bestAscent = route.ascents[0];

			// Return the best ascent
			return bestAscent;
		})

		// Find the max Grade for each tickType
		const maxGrades = {}
		for (const tickType of Object.keys(tickTypeValues)) {
			const filteredAscents = bestAscents.filter(ascent => ascent.tickType === tickType);

			if (filteredAscents.length === 0) {
				continue;
			}

			const maxGrade = filteredAscents.reduce((max, ascent) => {
				return ascent.route.grade > max ? ascent.route.grade : max;
			}, 0);

			maxGrades[tickType] = maxGrade;
		}

		// Find the all climbs for each tickType at the max grade
		const topAscents = {}
		for (const tickType of Object.keys(tickTypeValues)) {
			const filteredAscents = bestAscents.filter(ascent => ascent.tickType === tickType && ascent.route.grade === maxGrades[tickType]);

			if (filteredAscents.length === 0) {
				continue;
			}

			filteredAscents.sort((a, b) => new Date(b.date) - new Date(a.date));

			topAscents[tickType] = filteredAscents;
		}

		// Now get a count of ascents by tickType for the user
		const allAscents = await Ascent.find({ user: req.user._id })
			.populate({
				path: 'route',
				populate: {
				path: 'area'
				}
			});	

		const tickTypeCountsTotal = allAscents.reduce((obj, ascent) => {
			if (!obj[ascent.tickType]) {
				obj[ascent.tickType] = 1;
			}
			else {
				obj[ascent.tickType]++;
			}
			return obj;
		}, {});

		const tickTypeCountsByGrade = allAscents.reduce((obj, ascent) => {
			if (!obj[ascent.route.grade]) {
				obj[ascent.route.grade] = {
					flash: 0,
					redpoint: 0,
					hangdog: 0,
					attempt: 0
				}
			}

			obj[ascent.route.grade][ascent.tickType] += 1;

			return obj;
		}, {});



        res.status(200).json({ topAscents, tickTypeCountsTotal, tickTypeCountsByGrade });
        } catch (error) {
            next(error)
        }
    }
]