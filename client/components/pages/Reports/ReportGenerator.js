import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { format } from 'date-fns';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ReportPreview = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
`;

const Error = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
`;

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
});

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('appointments');
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`/api/analytics/${reportType}`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });
      setReportData(response.data);
    } catch (error) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const ReportDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</Text>
        </View>
        <View style={styles.section}>
          <Text>Date Range: {dateRange.startDate} to {dateRange.endDate}</Text>
        </View>
        {reportData && renderReportContent()}
      </Page>
    </Document>
  );

  const renderReportContent = () => {
    switch (reportType) {
      case 'appointments':
        return (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Date</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Patient</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Treatment</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Status</Text>
              </View>
            </View>
            {reportData.appointments.map((appointment, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{format(new Date(appointment.date), 'yyyy-MM-dd')}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{appointment.patient.name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{appointment.treatment}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{appointment.status}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      case 'revenue':
        return (
          <View style={styles.section}>
            <Text>Total Revenue: ${reportData.totalRevenue}</Text>
            <Text>Insurance Coverage: ${reportData.insuranceCoverage}</Text>
            <Text>Patient Payments: ${reportData.patientPayments}</Text>
          </View>
        );
      case 'treatments':
        return (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Treatment</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Count</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Average Cost</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Total Revenue</Text>
              </View>
            </View>
            {reportData.treatments.map((treatment, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{treatment.name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{treatment.count}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>${treatment.averageCost}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>${treatment.totalRevenue}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <Title>Report Generator</Title>
      </Header>

      <Form onSubmit={handleGenerateReport}>
        <FormGroup>
          <Label>Report Type</Label>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="appointments">Appointments Report</option>
            <option value="revenue">Revenue Analysis</option>
            <option value="treatments">Treatment Statistics</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>End Date</Label>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </Form>

      {error && <Error>{error}</Error>}

      {reportData && (
        <ReportPreview>
          <PDFDownloadLink
            document={<ReportDocument />}
            fileName={`${reportType}-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`}
          >
            {({ blob, url, loading, error }) =>
              loading ? 'Preparing PDF...' : (
                <Button style={{ marginBottom: '16px' }}>
                  Download PDF
                </Button>
              )
            }
          </PDFDownloadLink>

          {renderReportContent()}
        </ReportPreview>
      )}
    </Container>
  );
};

export default ReportGenerator; 