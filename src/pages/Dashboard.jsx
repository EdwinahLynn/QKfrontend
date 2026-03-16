import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import BusinessIcon from '@mui/icons-material/Business';
import api from '../services/api';

const SummaryCard = ({ title, value, icon, color }) => (
    <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
            <Box>
                <Typography color="textSecondary" variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {value}
                </Typography>
            </Box>
            <Box sx={{ backgroundColor: `${color}20`, p: 2, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </Box>
        </Paper>
    </Grid>
);

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get('/dashboard/summary');
                setSummary(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard summary", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Dashboard Overview
            </Typography>
            <Grid container spacing={3}>
                <SummaryCard
                    title="Total Employees"
                    value={summary?.totalEmployees || 0}
                    icon={<PeopleIcon sx={{ color: '#1976d2', fontSize: 40 }} />}
                    color="#1976d2"
                />
                <SummaryCard
                    title="Active Employees"
                    value={summary?.activeEmployees || 0}
                    icon={<PersonIcon sx={{ color: '#2e7d32', fontSize: 40 }} />}
                    color="#2e7d32"
                />
                <SummaryCard
                    title="Inactive Employees"
                    value={summary?.inactiveEmployees || 0}
                    icon={<PersonOffIcon sx={{ color: '#d32f2f', fontSize: 40 }} />}
                    color="#d32f2f"
                />
                <SummaryCard
                    title="Departments"
                    value={summary?.departments || 0}
                    icon={<BusinessIcon sx={{ color: '#ed6c02', fontSize: 40 }} />}
                    color="#ed6c02"
                />
            </Grid>
        </Box>
    );
};

export default Dashboard;
