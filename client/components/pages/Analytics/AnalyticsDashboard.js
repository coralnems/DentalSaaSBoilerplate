import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const DashboardContainer = styled.div`
  padding: 24px;
  background: #f8f9fa;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 18px;
`;

const DateRangePicker = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ChartContainer = styled.div`
  height: 300px;
`;

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('month');
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [demographicData, setDemographicData] = useState(null);
  const [efficiencyData, setEfficiencyData] = useState(null);

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    switch (dateRange) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setMonth(end.getMonth() - 1);
    }
    return { start, end };
  };

  useEffect(() => {
    const fetchData = async () => {
      const { start, end } = getDateRange();
      try {
        const [
          appointmentRes,
          revenueRes,
          demographicRes,
          efficiencyRes
        ] = await Promise.all([
          axios.get('/analytics/appointments', {
            params: { startDate: start, endDate: end }
          }),
          axios.get('/analytics/revenue', {
            params: { startDate: start, endDate: end }
          }),
          axios.get('/analytics/demographics'),
          axios.get('/analytics/efficiency', {
            params: { startDate: start, endDate: end }
          })
        ]);

        setAppointmentStats(appointmentRes.data);
        setRevenueData(revenueRes.data);
        setDemographicData(demographicRes.data);
        setEfficiencyData(efficiencyRes.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <DashboardContainer>
      <CardHeader>
        <Title>Analytics Dashboard</Title>
        <DateRangePicker>
          <span>Time Range:</span>
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </Select>
        </DateRangePicker>
      </CardHeader>

      <Grid>
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <Title>Revenue Overview</Title>
          </CardHeader>
          <ChartContainer>
            <ResponsiveContainer>
              <LineChart data={revenueData?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id" 
                  tickFormatter={(value) => {
                    return `${value.month}/${value.year}`;
                  }}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(value) => `${value.month}/${value.year}`}
                />
                <Legend />
                <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Total Revenue" />
                <Line type="monotone" dataKey="insuranceCovered" stroke="#82ca9d" name="Insurance" />
                <Line type="monotone" dataKey="patientPaid" stroke="#ffc658" name="Patient Paid" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Appointment Distribution */}
        <Card>
          <CardHeader>
            <Title>Appointment Types</Title>
          </CardHeader>
          <ChartContainer>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={appointmentStats?.typeDistribution || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Age Demographics */}
        <Card>
          <CardHeader>
            <Title>Patient Age Distribution</Title>
          </CardHeader>
          <ChartContainer>
            <ResponsiveContainer>
              <BarChart data={demographicData?.ageDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Scheduling Efficiency */}
        <Card>
          <CardHeader>
            <Title>Scheduling Efficiency</Title>
          </CardHeader>
          <ChartContainer>
            <ResponsiveContainer>
              <LineChart data={efficiencyData?.dailyStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => {
                    return `${value.month}/${value.day}`;
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="utilizationRate" stroke="#8884d8" name="Utilization Rate" />
                <Line type="monotone" dataKey="noShows" stroke="#ff8042" name="No Shows" />
                <Line type="monotone" dataKey="cancellations" stroke="#ff4242" name="Cancellations" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </Grid>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard; 