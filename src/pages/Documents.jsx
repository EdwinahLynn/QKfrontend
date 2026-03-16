import { useState } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Checkbox,
    FormControlLabel, FormGroup, Divider, Snackbar, Alert,
    CircularProgress, Chip, Card, CardContent, CardActions, Tooltip
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import PreviewIcon from '@mui/icons-material/Preview';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../services/api';

const DOCUMENT_OPTIONS = [
    { key: 'experience-certificate', label: 'Experience Certificate', description: 'Confirms employment period, designation, and conduct' },
    { key: 'relieving-letter', label: 'Relieving Letter', description: 'Formal acceptance of resignation and relieving from duties' },
    { key: 'salary-slip', label: 'Salary Slip', description: 'Monthly salary breakdown with earnings and deductions' },
    { key: 'no-dues-certificate', label: 'No Dues Certificate', description: 'Confirms all departmental clearances obtained' },
];

const initialForm = {
    employeeName: '',
    employeeId: '',
    designation: '',
    department: '',
    dateOfJoining: '',
    lastWorkingDate: '',
    salary: '',
    companyName: 'Qybrenthak Inc.',
    hrName: '',
    employeeEmail: '',
    additionalNotes: '',
};

const Documents = () => {
    const [form, setForm] = useState(initialForm);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [previewingDoc, setPreviewingDoc] = useState(null);
    const [sending, setSending] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const handleDocToggle = (key) => {
        setSelectedDocs(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleSelectAll = () => {
        setSelectedDocs(
            selectedDocs.length === DOCUMENT_OPTIONS.length ? [] : DOCUMENT_OPTIONS.map(d => d.key)
        );
    };

    const validate = () => {
        const required = ['employeeName', 'employeeId', 'designation', 'department',
            'dateOfJoining', 'lastWorkingDate', 'salary', 'companyName', 'hrName', 'employeeEmail'];
        const newErrors = {};
        required.forEach(field => {
            if (!form[field].toString().trim()) newErrors[field] = 'This field is required';
        });
        if (form.employeeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.employeeEmail)) {
            newErrors.employeeEmail = 'Enter a valid email address';
        }
        if (form.salary && isNaN(Number(form.salary))) {
            newErrors.salary = 'Salary must be a number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePreview = async (docKey) => {
        if (!validate()) {
            setSnackbar({ open: true, message: 'Please fill in all required fields before previewing.', severity: 'warning' });
            return;
        }
        setPreviewingDoc(docKey);
        try {
            const res = await api.post('/documents/preview', { type: docKey, data: form }, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch {
            setSnackbar({ open: true, message: 'Failed to generate preview. Please try again.', severity: 'error' });
        } finally {
            setPreviewingDoc(null);
        }
    };

    const handleSend = async () => {
        if (!validate()) {
            setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'warning' });
            return;
        }
        if (selectedDocs.length === 0) {
            setSnackbar({ open: true, message: 'Please select at least one document to send.', severity: 'warning' });
            return;
        }
        setSending(true);
        try {
            const res = await api.post('/documents/send', { data: form, documentTypes: selectedDocs });
            setSnackbar({ open: true, message: res.data.message, severity: 'success' });
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to send documents. Check email configuration.',
                severity: 'error'
            });
        } finally {
            setSending(false);
        }
    };

    const handleReset = () => {
        setForm(initialForm);
        setSelectedDocs([]);
        setErrors({});
    };

    const field = (name, label, props = {}) => (
        <TextField
            fullWidth
            size="small"
            name={name}
            label={label}
            value={form[name]}
            onChange={handleChange}
            error={!!errors[name]}
            helperText={errors[name]}
            {...props}
        />
    );

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={600} color="text.primary">
                    Document Generation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Enter employee details once to generate and send multiple HR documents.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left — Form */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Employee Details
                        </Typography>
                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('employeeName', 'Employee Name *')}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('employeeId', 'Employee ID *', { placeholder: 'e.g. EMP001' })}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('designation', 'Designation *')}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('department', 'Department *')}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('dateOfJoining', 'Date of Joining *', { type: 'date', InputLabelProps: { shrink: true } })}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('lastWorkingDate', 'Last Working Date *', { type: 'date', InputLabelProps: { shrink: true } })}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('salary', 'Monthly Salary *', { placeholder: 'e.g. 50000', type: 'number' })}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('employeeEmail', 'Employee Email *', { type: 'email' })}
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                            Company & HR Details
                        </Typography>
                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('companyName', 'Company Name *')}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {field('hrName', 'HR Name / Authorized Signatory *')}
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                {field('additionalNotes', 'Additional Notes (Optional)', {
                                    multiline: true,
                                    rows: 2,
                                    placeholder: 'Any additional information to include in the documents...'
                                })}
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5 }}>
                            <Button variant="outlined" color="inherit" onClick={handleReset} size="small">
                                Clear Form
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right — Document Selection & Actions */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper sx={{ p: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Select Documents
                            </Typography>
                            <Button size="small" onClick={handleSelectAll} sx={{ textTransform: 'none' }}>
                                {selectedDocs.length === DOCUMENT_OPTIONS.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        <FormGroup sx={{ gap: 1 }}>
                            {DOCUMENT_OPTIONS.map((doc) => (
                                <Card
                                    key={doc.key}
                                    variant="outlined"
                                    sx={{
                                        borderColor: selectedDocs.includes(doc.key) ? 'primary.main' : 'divider',
                                        backgroundColor: selectedDocs.includes(doc.key) ? 'primary.50' : 'transparent',
                                        transition: 'all 0.15s',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleDocToggle(doc.key)}
                                >
                                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                            <Checkbox
                                                checked={selectedDocs.includes(doc.key)}
                                                onChange={() => handleDocToggle(doc.key)}
                                                onClick={(e) => e.stopPropagation()}
                                                size="small"
                                                sx={{ p: 0, mt: 0.2 }}
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {doc.label}
                                                    </Typography>
                                                    <Tooltip title={`Preview ${doc.label}`}>
                                                        <span>
                                                            <Button
                                                                size="small"
                                                                startIcon={
                                                                    previewingDoc === doc.key
                                                                        ? <CircularProgress size={12} />
                                                                        : <PreviewIcon fontSize="small" />
                                                                }
                                                                onClick={(e) => { e.stopPropagation(); handlePreview(doc.key); }}
                                                                disabled={!!previewingDoc}
                                                                sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 0, px: 1 }}
                                                            >
                                                                Preview
                                                            </Button>
                                                        </span>
                                                    </Tooltip>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {doc.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </FormGroup>
                    </Paper>

                    {/* Send Panel */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Send via Email
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {selectedDocs.length > 0 ? (
                            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                {selectedDocs.map(key => (
                                    <Chip
                                        key={key}
                                        label={DOCUMENT_OPTIONS.find(d => d.key === key)?.label}
                                        size="small"
                                        icon={<CheckCircleOutlineIcon />}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                No documents selected. Check the boxes above.
                            </Typography>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            All selected documents will be generated as PDFs and sent as attachments to{' '}
                            <strong>{form.employeeEmail || '[employee email]'}</strong>.
                        </Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                            onClick={handleSend}
                            disabled={sending || selectedDocs.length === 0}
                        >
                            {sending ? 'Sending...' : `Send ${selectedDocs.length > 0 ? `${selectedDocs.length} ` : ''}Document${selectedDocs.length !== 1 ? 's' : ''}`}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Documents;
