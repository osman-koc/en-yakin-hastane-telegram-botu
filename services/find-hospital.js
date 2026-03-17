import 'dotenv/config';
import geolib from 'geolib';
import queryString from 'query-string';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: calculate distances and sort a list of hospitals by proximity
function sortHospitalsByDistance(hospitals, userLocation) {
    return hospitals
        .map(hospital => {
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
        })
        .sort((a, b) => a.distance - b.distance);
}

// Function to get user location and find hospitals by province and district
// Falls back to city-wide, then nationwide distance-based search if no results found
async function findHospitalsFromDb(city, district, userLocation) {
    const upperCaseCity = city.toLocaleUpperCase('tr');
    const upperCaseDistrict = district.toLocaleUpperCase('tr');

    // Load hospitals data dynamically with correct path
    const hospitalsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/hospitals.json'), 'utf-8'));

    // 1. Try exact city + district match
    const byDistrict = hospitalsData.filter(hospital =>
        hospital.city.toLocaleUpperCase('tr') === upperCaseCity &&
        hospital.district.toLocaleUpperCase('tr') === upperCaseDistrict
    );
    if (byDistrict.length > 0) {
        return { hospitals: sortHospitalsByDistance(byDistrict, userLocation), fallback: null };
    }

    // 2. Fall back to city-wide match
    const byCity = hospitalsData.filter(hospital =>
        hospital.city.toLocaleUpperCase('tr') === upperCaseCity
    );
    if (byCity.length > 0) {
        return { hospitals: sortHospitalsByDistance(byCity, userLocation), fallback: 'city' };
    }

    // 3. Fall back to nearest hospitals in entire database
    return { hospitals: sortHospitalsByDistance(hospitalsData, userLocation), fallback: 'nationwide' };
}

export { findHospitalsFromDb };
