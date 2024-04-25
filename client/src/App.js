import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import html2pdf from 'html2pdf.js';

function App() {
  const [country, setCountry] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/country-data?country=${encodeURIComponent(country)}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('pdf-container');
    const opt = {
      margin: 1,
      filename: `${country}-OGAReport.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { avoid: '.page-break' },
      background: '#fff'
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <Container align="center">
      <Typography variant="h4" align="center" style={{ marginBottom: '20px' }}>
        Duke Office of Global Affairs Airtable API Tool
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </Button>
      </form>
      {data && !loading && (
        <div style={{ marginTop: '20px' }} id="pdf-container">
          <Typography variant="h5" style={{ marginBottom: '20px', fontWeight: 'bold' }}>
            Global Data for {country}
          </Typography>
          <Typography variant="h6">
            Number of Agreements: {data.agreementsCount}
          </Typography>
          <Typography variant="h6">
            Number of Co-authorships: {data.coAuthorshipsCount}
          </Typography>
          <Typography variant="h6">
            Total Number of Students Currently Enrolled Since 2022: {data.studentsCount}
          </Typography>
          <Typography variant="h6">
            Number of Faculty with Relevant Expertise: {data.expertiseCount}
          </Typography>
          <Typography variant="h6">
            Number of Alumni Since 2021: {data.alumniCount}
          </Typography>
          <Typography variant="h6">
            Number of Abroad Programs Since 2019: {data.programsCount}
          </Typography>
          <Typography variant="h6">
            Abroad Program Enrollment Since 2019: {data.programsEnrollment}
          </Typography>
        </div>
      )}
      {data && !loading && (
        <Button
          type="button"
          variant="contained"
          color="secondary"
          style={{ marginTop: '20px' }}
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
      )}
    </Container>
  );
}

export default App;
