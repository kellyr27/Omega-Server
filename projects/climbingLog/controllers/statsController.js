const Ascent = require('../models/ascentModel');
const Route = require('../models/routeModel');
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

exports.getSteepnessStats = [
	async (req, res, next) => {
		try {
			/**
			 * Slab Ascents
			 */
			const slabStats = {
				'flash': null,
				'redpoint': null,
			}

			const slabRoutes = await Route
				.find({ user: req.user._id, steepness: 'slab' })
				.populate('ascents')
				.populate({
					path: 'ascents',
					populate: {
					path: 'route'
					}
				});
			/**
			 * For each Slab route, find the best ascent. 
			 * The best ascent is the only with the highest tickType, then if there are multiple the one with the earliest date
			 */
			const tickTypeValues = {
				flash: 4,
				redpoint: 3,
				hangdog: 2,
				attempt: 1
			  };
			  
			const slabBestAscents = slabRoutes.map(route => {
				// Assuming route.ascents is an array of ascents for the route
				if (!route.ascents || route.ascents.length === 0) {
					return null;
				}
				
				// Sort ascents by tickType and date
				const sortedAscents = route.ascents.sort((a, b) => {
					if (tickTypeValues[a.tickType] !== tickTypeValues[b.tickType]) {
						return tickTypeValues[b.tickType] - tickTypeValues[a.tickType];
					} else {
						return new Date(a.date) - new Date(b.date);
					}
				});

				const bestAscent = sortedAscents[0];

				// Return the best ascent
				return bestAscent;
			})




			for (const tickType of Object.keys(slabStats)) {
				// Filter ascents with the current tickType
				const filteredAscents = slabBestAscents.filter(ascent => ascent.tickType === tickType);

				// If no ascents with that tickType, go to next iteration
				if (filteredAscents.length === 0) {
					continue;
				}

				// Find the max grade for the current tickType
				const maxGrade = filteredAscents.reduce((max, ascent) => {
					return ascent.route.grade > max ? ascent.route.grade : max;
				}, 0);

				// Filter ascents with the max grade
				const maxGradeAscents = filteredAscents.filter(ascent => ascent.route.grade === maxGrade);


				// Order the ascents by date descending
				maxGradeAscents.sort((a, b) => new Date(b.date) - new Date(a.date));

				// Take the top three ascents
				const topThreeAscents = maxGradeAscents.slice(0, 3);

				slabStats[tickType] = topThreeAscents

			}

			console.log(slabStats);

			res.status(200).json({ message: 'Steepness stats' });

		} catch (error) {
			next(error)
		}
	}
]