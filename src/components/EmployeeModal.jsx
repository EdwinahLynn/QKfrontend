import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, Alert
} from '@mui/material';
import api from '../services/api';

const initialForm = {
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    status: 'Active'
};

const EmployeeModal = ({ open, onClose, employee, onSave }) => {
    const [formData, setFormData] = useState(initialForm);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const isEditMode = Boolean(employee);

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                department: employee.department,
                designation: employee.designation,
                salary: employee.salary,
                status: employee.status
            });
        } else {
            setFormData(initialForm);
        }
        setError(null);
    }, [employee, open]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditMode) {
                await api.put(`/employees/${employee._id}`, formData);
            } else {
                await api.post('/employees', formData);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                name="name"
                                label="Full Name"
                                fullWidth
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="email"
                                type="email"
                                label="Email Address"
                                fullWidth
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="phone"
                                label="Phone Number"
                                fullWidth
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="department"
                                label="Department"
                                select
                                fullWidth
                                required
                                value={formData.department}
                                onChange={handleChange}
                            >
                                <MenuItem value="IT">IT</MenuItem>
                                <MenuItem value="HR">HR</MenuItem>
                                <MenuItem value="Finance">Finance</MenuItem>
                                <MenuItem value="Engineering">Engineering</MenuItem>
                                <MenuItem value="Sales">Sales</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="designation"
                                label="Designation"
                                fullWidth
                                required
                                value={formData.designation}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="salary"
                                type="number"
                                label="Salary"
                                fullWidth
                                required
                                value={formData.salary}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="status"
                                label="Status"
                                select
                                fullWidth
                                required
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EmployeeModal;
