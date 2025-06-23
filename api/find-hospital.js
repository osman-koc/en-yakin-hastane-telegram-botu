import 'dotenv/config';
import geolib from 'geolib';
import queryString from 'query-string';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get user location and find hospitals by province and district
async function findHospitalsFromDb(city, district, userLocation) {
    const upperCaseCity = city.toLocaleUpperCase('tr');
    const upperCaseDistrict = district.toLocaleUpperCase('tr');

    // Load hospitals data dynamically with correct path
    const hospitalsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/hospitals.json'), 'utf-8'));

    // Filter hospitals by province and district
    const filteredHospitals = hospitalsData.filter(hospital =>
        hospital.city.toLocaleUpperCase('tr') === upperCaseCity &&
        hospital.district.toLocaleUpperCase('tr') === upperCaseDistrict
    );

    // Calculate the distance from the centre for each hospital and sort
    const hospitalsWithDistances = filteredHospitals.map(hospital => {
        const hospitalLocation = {
            latitude: parseFloat(hospital.location.lat),
            longitude: parseFloat(hospital.location.lon)
        };

        let googleMapsUrl;

        if (hospital.address && hospital.address.length > 0) {
            const addressQuery = queryString.stringify({ query: hospital.address });
            googleMapsUrl = `${process.env.GOOGLE_MAPS_URI}&${addressQuery}`;
        }

        const distance = geolib.getDistance(userLocation, hospitalLocation); // Distance in metres
        return { ...hospital, distance, googleMapsUrl };
    });

    // Sort by distance
    hospitalsWithDistances.sort((a, b) => a.distance - b.distance);

    return hospitalsWithDistances;
}

export { findHospitalsFromDb };
