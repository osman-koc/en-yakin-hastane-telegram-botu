import 'dotenv/config';

async function appendUsageDataToGoogleSheets(logData) {
    const url = `${process.env.MY_API_URI}/append-to-google-sheets/hospital`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ logData })
        });

        if (!response.ok) {
            throw new Error('Failed to append data to Google Sheets');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error appending hospitals to Google Sheets:', error);
        throw error;
    }
}

export { appendUsageDataToGoogleSheets };
