const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const Airtable = require('airtable');

app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const base = new Airtable({apiKey: 'keyIkPEIhDHGx5au9'}).base('apptx7sOc1eXZGTdy');
const base2 = new Airtable({apiKey: 'keyIkPEIhDHGx5au9'}).base('apppEgXR5q8gOgo3N');

app.get('/api/country-data', async (req, res) => {
  const country = req.query.country || 'India';
  console.log(country);
  try {
    const data = await fetchCounts(country);
    console.log('Data:', data);
    res.setHeader('Content-Type', 'application/json'); 
    res.send(JSON.stringify(data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

async function fetchCounts(country) {
  const relationsPromise = base('Relations').select({
    filterByFormula: `FIND('${country}', ARRAYJOIN({Country}, ',')) > 0`,
    view: 'viwBnoClrGlfMovDP'
  }).all();

  const coAuthorshipsPromise = base2('International Co-authorships').select({
    filterByFormula: `FIND('${country}', ARRAYJOIN({Country Name}, ',')) > 0`,
    view: 'viwN2XKKnAIRlJr8X'
  }).all();

  const studentsPromise = base2('International Students by Citizenship (Fall 2022)').select({
    filterByFormula: `{Country of Citizenship} = '${country}'`,
    view: 'viwYqumyBfZa3pX9h',
    fields: ['Total']
  }).all();

  const expertisePromise = base2('Faculty Expertise 2022-23').select({
    filterByFormula: `FIND('${country}', ARRAYJOIN({Global Scholarship}, ',')) > 0`,
    view: 'viwf3DcvZUE1wtcop'
  }).all();

  const alumniPromise = base2('Alumni by Country of Residence Since 2021').select({
    filterByFormula: `{Country} = '${country}'`,
    view: 'viwL1hm7YrfLbFCNS',
    fields: ['Total']
  }).all();

  const programsPromise = base2('Duke Study Abroad Program Enrolments Since 2019').select({
    filterByFormula: `{Country Link} = '${country}'`,
    view: 'viwDG8E2wsvry3BFw',
    fields: ['Count']
  }).all();

  try {
    const [relations, coAuthorships, students, expertise, alumni, programs] = await Promise.all([relationsPromise, coAuthorshipsPromise, studentsPromise, expertisePromise, alumniPromise, programsPromise]);
    const agreementsCount = relations.length;
    const coAuthorshipsCount = coAuthorships.length;
    const studentsCount = students.length > 0 ? students[0].fields['Total'] : 0;
    const expertiseCount = expertise.length;
    const alumniCount = alumni.length > 0 ? alumni[0].fields['Total'] : 0;
    const programsCount = programs.length
    const programsEnrollment = programs.length > 0 ? programs.map(program => program.fields['Count']).reduce((acc, val) => acc + val) : 0;
    

    return { agreementsCount, coAuthorshipsCount, studentsCount, expertiseCount, alumniCount, programsCount, programsEnrollment };
  } catch (err) {
    console.error(err);
  }
}
