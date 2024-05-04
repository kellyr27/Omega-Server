// const User = require('../models/userModel')
// const Ascent = require('../models/ascentModel')
// const Route = require('../models/routeModel')

const XLSX = require('xlsx');
const path = require('path');

/**
 * Converts an Excel date (stored as a serial number) into a JavaScript Date object.
 *
 * @param {number} serial - The Excel date serial number.
 * @returns {Date} - The JavaScript Date object.
 *
 * The function works by:
 * 1. Calculating the number of UTC days by subtracting 25569 from the Excel date serial.
 * 2. Converting the number of UTC days into seconds.
 * 3. Creating a new JavaScript Date object from these seconds.
 * 4. Calculating the fractional part of the day from the Excel date serial.
 * 5. Converting this fractional part into seconds.
 * 6. Calculating the hours, minutes, and seconds from these total seconds.
 * 7. Returning a new JavaScript Date object, created with the year, month, and date from the original Date object, 
 *    and the hours, minutes, and seconds calculated from the fractional part of the day.
 */
const excelDateToJSDate = (serial) => {
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;                                        
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;
    total_seconds -= seconds;

    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;

    // Create the Date object in UTC
    return new Date(Date.UTC(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds));
};

// Load the Excel file
const getAscentsObjects = async () => {
    const workbook = XLSX.readFile(path.resolve(__dirname, 'Climbing Log - Copy.xlsx'));

    // Get the first sheet
    const ascentsSheet = workbook.SheetNames[0];
    const routesSheet = workbook.SheetNames[1];
    const ascentsWorksheet = workbook.Sheets[ascentsSheet];
    const routesWorksheet = workbook.Sheets[routesSheet];

    // // Convert the sheet to JSON
    const ascentsJsonData = XLSX.utils.sheet_to_json(ascentsWorksheet);
    const routesJsonData = XLSX.utils.sheet_to_json(routesWorksheet);

    // // Convert the JSON data to a list of objects
    const routesObjectsList = routesJsonData.map(item => {
        return {
            id: item.Id,
            name: item.Name,
            grade: item.Grade,
            colour: item.Colour.toLowerCase()
        }
    }).filter(route => route.name !== undefined);

    const ascentsObjectsList = ascentsJsonData.map(item => {
        // Save the route name and grade
        const route = routesObjectsList.find(route => route.id === item.RouteId);
        item.date = excelDateToJSDate(item.Date);
        
        if (item.Notes === undefined) {
            item.Notes = '';
        }

        return {
            date: excelDateToJSDate(item.Date),
            tickType: item.TickType.toLowerCase(),
            notes: item.Notes,
            route
        };
    });

    return ascentsObjectsList
}

module.exports = getAscentsObjects;