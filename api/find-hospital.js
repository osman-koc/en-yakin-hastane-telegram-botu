import 'dotenv/config';
import geolib from 'geolib';
import queryString from 'query-string';
import hospitalsData from '../db/hospitals.json' assert { type: 'json' };

// Function to get user location and find pharmacies by province and district
async function findHospitalsFromDb(city, district, userLocation) {
    const upperCaseCity = city.toLocaleUpperCase('tr');
    const upperCaseDistrict = district.toLocaleUpperCase('tr');

    // Filter hospitals by province and district
    const filteredHospitals = hospitalsData.filter(hospital =>
        hospital.city.toLocaleUpperCase('tr') === upperCaseCity &&
        hospital.district.toLocaleUpperCase('tr') === upperCaseDistrict
    );

    // Calculate the distance from the centre for each pharmacy and sort
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
