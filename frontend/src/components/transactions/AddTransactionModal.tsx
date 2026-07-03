import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import api from '../../api/client';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTransactionModal({ open, onClose, onSuccess }: AddTransactionModalProps) {
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    customer: '',
    amount: '',
    currency: 'USD',
    transaction_type: 'DEPOSIT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/?page_size=100');
      setCustomers(res.data.results || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/transactions/', {
        customer: parseInt(formData.customer),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        transaction_type: formData.transaction_type,
      });
      onSuccess();
      onClose();
      setFormData({ customer: '', amount: '', currency: 'USD', transaction_type: 'DEPOSIT' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create transaction.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <DialogTitle sx={{ color: '#fff', background: 'rgba(15,23,42,0.95)' }}>
          Add New Transaction
        </DialogTitle>
        <DialogContent sx={{ background: 'rgba(15,23,42,0.95)', color: '#fff' }}>
          {error && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(239,68,68,0.15)', borderRadius: 1, color: '#f87171' }}>
              {error}
            </Box>
          )}
          <FormControl fullWidth margin="dense" sx={{ mt: 1 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Customer</InputLabel>
            <Select
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              required
              sx={{ color: '#fff', '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.6)' } }}
            >
              <MenuItem value="">Select a customer</MenuItem>
              {customers.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="dense"
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            sx={{ input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.6)' } }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Currency</InputLabel>
            <Select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              sx={{ color: '#fff', '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.6)' } }}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              <MenuItem value="NGN">NGN</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Type</InputLabel>
            <Select
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              sx={{ color: '#fff', '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.6)' } }}
            >
              <MenuItem value="DEPOSIT">Deposit</MenuItem>
              <MenuItem value="WITHDRAWAL">Withdrawal</MenuItem>
              <MenuItem value="TRANSFER">Transfer</MenuItem>
            </Select>
          </FormControl>
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
            {loading ? 'Creating...' : 'Create Transaction'}
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
}