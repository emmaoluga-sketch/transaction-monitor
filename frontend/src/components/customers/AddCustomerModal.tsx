import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import api from '../../api/client';

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCustomerModal({ open, onClose, onSuccess }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    is_high_risk: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/customers/', formData);
      onSuccess();
      onClose();
      setFormData({ name: '', email: '', phone: '', address: '', country: '', is_high_risk: false });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <DialogTitle sx={{ color: '#fff', background: 'rgba(15,23,42,0.95)' }}>
          Add New Customer
        </DialogTitle>
        <DialogContent sx={{ background: 'rgba(15,23,42,0.95)', color: '#fff' }}>
          {error && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(239,68,68,0.15)', borderRadius: 1, color: '#f87171' }}>
              {error}
            </Box>
          )}
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.6)' } }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.6)' } }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            sx={{ input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.6)' } }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            sx={{ input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.6)' } }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            sx={{ input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.6)' } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="is_high_risk"
                checked={formData.is_high_risk}
                onChange={handleChange}
                sx={{ color: 'rgba(255,255,255,0.6)' }}
              />
            }
            label="High Risk Customer"
            sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(15,23,42,0.95)', pb: 2, px: 3 }}>
          <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#fff',
              '&:hover': { background: 'linear-gradient(135deg, #2563eb, #7c3aed)' },
            }}
          >
            {loading ? 'Creating...' : 'Create Customer'}
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
}