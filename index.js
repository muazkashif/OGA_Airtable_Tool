const express = require('express');
const cors = require('cors');
const Airtable = require('airtable');

// Initialize the Airtable API - replace with your API key and base configuration
Airtable.configure({
    apiKey: '',
});
const base = Airtable.base('apptx7sOc1eXZGTdy');
const base2 = Airtable.base('apppEgXR5q8gOgo3N');

const app = express();
app.use(cors()); // Enable CORS for client-side
app.use(express.json()); // To parse JSON bodies

// Function to fetch data from Airtable
async function fetchCounts(country) {
    try {
        const [relations, coAuthorships, students, expertise, alumni, programs] = await Promise.all([
            base('Relations').select({
                filterByFormula: `AND(FIND('${country}', ARRAYJOIN({Country}, ',')) > 0, {Relation Type} = 'Partnership')`,
                view: 'viwBnoClrGlfMovDP'
            }).all(),
            base2('2022 International Co-authorships').select({
                filterByFormula: `FIND('${country}', ARRAYJOIN({Country Name}, ',')) > 0`,
                view: 'viwN2XKKnAIRlJr8X'
            }).all(),
            base2('International Students by Citizenship (2022-24)').select({
                filterByFormula: `{Country of Citizenship} = '${country}'`,
                view: 'viw50IeVldPs0317X',
                fields: ['Total']
            }).all(),
            base2('Faculty Expertise 2022-23').select({
                filterByFormula: `FIND('${country}', ARRAYJOIN({Global Scholarship}, ',')) > 0`,
                view: 'viwf3DcvZUE1wtcop'
            }).all(),
            base2('Alumni by Country of Residence Since 2021').select({
                filterByFormula: `{Country} = '${country}'`,
                view: 'viwL1hm7YrfLbFCNS',
                fields: ['Total']
            }).all(),
            base2('Duke Study Abroad Program Enrolments Since 2019').select({
                filterByFormula: `{Country Link} = '${country}'`,
                view: 'viwDG8E2wsvry3BFw',
                fields: ['Count']
            }).all()
        ]);

        const agreementsCount = relations.length;
        const coAuthorshipsCount = coAuthorships.length;
        const studentsCount = students.length > 0 ? students[0].fields['Total'] || 0 : 0;
        const expertiseCount = expertise.length;
        const alumniCount = alumni.length > 0 ? alumni[0].fields['Total'] : 0;
        const programsCount = programs.length
        const programsEnrollment = programs.length > 0 ? programs.map(program => program.fields['Count']).reduce((acc, val) => acc + val, 0) : 0;

        return { agreementsCount, coAuthorshipsCount, studentsCount, expertiseCount, alumniCount, programsCount, programsEnrollment };
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

// API endpoint
app.get('/api/country-data', async (req, res) => {
    const country  = req.query.country;
    
    // Log the country name to the console
    console.log("Received country name:", country);

    try {
        const data = await fetchCounts(country);
        console.log("Data:", data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
