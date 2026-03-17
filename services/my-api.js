import 'dotenv/config';

async function appendUsageDataToGoogleSheets(logData) {
    const url = `${process.env.MY_API_URI}/append-to-google-sheets-hospital`;

    const headers = {
        'Content-Type': 'application/json',
    };
    if (process.env.MY_API_KEY) {
        headers['x-api-key'] = process.env.MY_API_KEY;
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ logData })
    });

    if (!response.ok) {
        throw new Error('Failed to append data to Google Sheets');
    }

    return response.json();
}

export { appendUsageDataToGoogleSheets };
