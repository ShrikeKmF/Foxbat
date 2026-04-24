/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// utils/sheets.js
// Google Sheets utility functions
/////////////////////////////////////////////////////////////////

const { google } = require('googleapis');
const { RTG_ORBAT_ID, MEMBER_ROSTER } = require('../config');

// Build the Google Auth client from the JSON stored in the env var.
// The env var holds the raw JSON string of the service account credentials.
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ----------------------------------------------------------------
// Internal helpers
// ----------------------------------------------------------------

/** Convert a column letter (A–Z) to a 0-based index. */
function columnToIndex(column) {
    return column.toUpperCase().charCodeAt(0) - 65;
}

/** Fetch all data from a sheet as a 2D array. */
async function getSheetData(spreadsheetId, sheetName) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
    });
    return response.data.values || [];
}

// ----------------------------------------------------------------
// Exported helpers
// ----------------------------------------------------------------

/**
 * Find the row whose column-A value matches searchValue and update
 * a single cell in that row.
 */
async function updateCellInRow(spreadsheetId, sheetName, searchValue, column, newValue) {
    try {
        const colIndex = columnToIndex(column);
        if (colIndex < 0 || colIndex > 25) throw new Error('Invalid column letter.');

        const sheetData = await getSheetData(spreadsheetId, sheetName);
        const rowIndex = sheetData.findIndex(row => row[0] === searchValue);

        if (rowIndex === -1) {
            console.warn(`[Sheets] Row not found for "${searchValue}" in ${sheetName}`);
            return;
        }

        const rowNumber = rowIndex + 1; // Google Sheets is 1-based
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!${column}${rowNumber}`,
            valueInputOption: 'RAW',
            requestBody: { values: [[newValue]] },
        });

        console.log(`[Sheets] Updated ${sheetName}!${column}${rowNumber} → "${newValue}"`);
    } catch (error) {
        console.error('[Sheets] updateCellInRow error:', error);
    }
}

/**
 * Remove a user from the ORBAT:
 * - Sets column A to "Vacant"
 * - Clears all other columns except column I
 */
async function removeUserFromSheet(spreadsheetId, sheetName, userTag) {
    try {
        const sheetData = await getSheetData(spreadsheetId, sheetName);
        const rowIndex = sheetData.findIndex(row => row[0] === userTag);

        if (rowIndex === -1) {
            console.warn(`[Sheets] User "${userTag}" not found in ${sheetName}`);
            return;
        }

        const rowNumber = rowIndex + 1;
        const EXCLUDED = ['I'];

        for (let col = 0; col < sheetData[rowIndex].length; col++) {
            const colLetter = String.fromCharCode(65 + col);
            if (EXCLUDED.includes(colLetter)) continue;

            const newValue = colLetter === 'A' ? 'Vacant' : '';
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!${colLetter}${rowNumber}`,
                valueInputOption: 'RAW',
                requestBody: { values: [[newValue]] },
            });
        }

        console.log(`[Sheets] Removed user "${userTag}" from ${sheetName}`);
    } catch (error) {
        console.error('[Sheets] removeUserFromSheet error:', error);
    }
}

/**
 * Returns true if the target cell is empty (no data yet), false otherwise.
 * Used by probation-op to find the next available slot.
 */
async function isCellEmpty(spreadsheetId, sheetName, searchName, targetColumn) {
    try {
        const sheetData = await getSheetData(spreadsheetId, sheetName);
        const row = sheetData.find(r => r[0] === searchName);

        if (!row) {
            console.warn(`[Sheets] Name "${searchName}" not found in ${sheetName}`);
            return false;
        }

        const cellValue = row[columnToIndex(targetColumn)] ?? '';
        return cellValue === '';
    } catch (error) {
        console.error('[Sheets] isCellEmpty error:', error);
        return false;
    }
}

/** Convenience: today's date as a Google Sheets serial number. */
function todayAsSerial() {
    const referenceDate = new Date(1899, 11, 30);
    return Math.floor((new Date() - referenceDate) / (1000 * 60 * 60 * 24));
}

module.exports = {
    updateCellInRow,
    removeUserFromSheet,
    isCellEmpty,
    todayAsSerial,
};
