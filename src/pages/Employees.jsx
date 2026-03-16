import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    TextField, MenuItem, IconButton, Tooltip, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    Chip, Snackbar, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Email as EmailIcon } from '@mui/icons-material';
import api from '../services/api';
import EmployeeModal from '../components/EmployeeModal';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Pagination & Filters
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('');
    const [status, setStatus] = useState('');
    const [sort, setSort] = useState('createdAt_desc');

    // Modals state
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Offer letter state
    const [offerLetterLoading, setOfferLetterLoading] = useState(null); // holds employee _id while sending
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                search: debouncedSearch,
                sort
            };
            if (department) params.department = department;
            if (status) params.status = status;

            const { data } = await api.get('/employees', { params });
            setEmployees(data.data);
            setTotal(data.total);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, debouncedSearch, department, status, sort]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenModal = (employee = null) => {
        setSelectedEmployee(employee);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleSave = () => {
        fetchEmployees();
    };

    const handleDeleteClick = (employee) => {
        setSelectedEmployee(employee);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/employees/${selectedEmployee._id}`);
            setDeleteDialogOpen(false);
            setSelectedEmployee(null);
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee', error);
        }
    };

    const handleSendOfferLetter = async (emp) => {
        setOfferLetterLoading(emp._id);
        try {
            const { data } = await api.post(`/employees/${emp._id}/send-offer-letter`);
            setSnackbar({ open: true, message: data.message, severity: 'success' });
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to send offer letter.';
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setOfferLetterLoading(null);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Employees</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                    Add Employee
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="Search (Name, Email, Phone)"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                    InputProps={{
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                    }}
                />
                <TextField
                    select
                    label="Department"
                    size="small"
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value); setPage(0); }}
                    sx={{ minWidth: '150px' }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Engineering">Engineering</MenuItem>
                    <MenuItem value="Sales">Sales</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Status"
                    size="small"
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                    sx={{ minWidth: '150px' }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Sort By"
                    size="small"
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(0); }}
                    sx={{ minWidth: '150px' }}
                >
                    <MenuItem value="createdAt_desc">Newest First</MenuItem>
                    <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                    <MenuItem value="salary_desc">Salary (High to Low)</MenuItem>
                    <MenuItem value="salary_asc">Salary (Low to High)</MenuItem>
                </TextField>
            </Paper>

            <TableContainer component={Paper}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Designation</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Salary</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No employees found.</TableCell>
                                </TableRow>
                            ) : (
                                employees.map((emp) => (
                                    <TableRow key={emp._id} hover>
                                        <TableCell>{emp.name}</TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                        <TableCell>{emp.department}</TableCell>
                                        <TableCell>{emp.designation}</TableCell>
                                        <TableCell>${emp.salary.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={emp.status}
                                                color={emp.status === 'Active' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" onClick={() => handleOpenModal(emp)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => handleDeleteClick(emp)} disabled={emp.status === 'Inactive'}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Send Offer Letter">
                                                <span>
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => handleSendOfferLetter(emp)}
                                                        disabled={offerLetterLoading === emp._id}
                                                    >
                                                        {offerLetterLoading === emp._id
                                                            ? <CircularProgress size={20} color="success" />
                                                            : <EmailIcon />}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Editor Modal */}
            <EmployeeModal
                open={modalOpen}
                onClose={handleCloseModal}
                employee={selectedEmployee}
                onSave={handleSave}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {selectedEmployee?.name}? This action will mark them as inactive.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Offer Letter Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Employees;
