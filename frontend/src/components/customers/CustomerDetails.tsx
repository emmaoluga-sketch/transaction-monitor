import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  is_high_risk: boolean;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  risk_score: number;
  created_at: string;
}

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const custRes = await api.get(`/customers/${id}/`);
      setCustomer(custRes.data);

      const txRes = await api.get('/transactions/', {
        params: { customer__id: id }
      });
      setTransactions(txRes.data.results || []);
    } catch (err) {
      setError('Failed to load customer details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/customers/${id}/`);
      navigate('/customers');
    } catch (err) {
      console.error('Failed to delete customer', err);
      setError('Failed to delete customer.');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return <div className="details-container"><div className="details-card"><div className="empty-state">Loading customer details...</div></div></div>;
  }

  if (error || !customer) {
    return (
      <div className="details-container">
        <div className="details-card">
          <div className="empty-state">{error || 'Customer not found'}</div>
          <button onClick={() => navigate('/customers')} className="back-btn">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="details-container"
    >
      <div className="details-card">
        <div className="details-header">
          <button onClick={() => navigate('/customers')} className="back-btn">
            <ArrowLeft size={18} />
            <span>Back to Customers</span>
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={fetchData} className="refresh-btn">
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="refresh-btn"
              style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="details-body">
          <div className="details-section">
            <h2 className="section-title">Customer Profile</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <span className="info-value highlight">{customer.name}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span className="info-value">{customer.email}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span className="info-value">{customer.phone}</span>
              </div>
              <div className="info-item">
                <label>Address</label>
                <span className="info-value">{customer.address}</span>
              </div>
              <div className="info-item">
                <label>Country</label>
                <span className="info-value">{customer.country}</span>
              </div>
              <div className="info-item">
                <label>Risk Status</label>
                <span className={`info-value ${customer.is_high_risk ? 'risk-high' : 'risk-low'}`}>
                  {customer.is_high_risk ? 'HIGH RISK' : 'LOW RISK'}
                </span>
              </div>
              <div className="info-item">
                <label>Joined</label>
                <span className="info-value">{new Date(customer.created_at).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <span className="info-value">{new Date(customer.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3 className="section-subtitle">Transactions ({transactions.length})</h3>
            {transactions.length === 0 ? (
              <div className="empty-state">No transactions for this customer.</div>
            ) : (
              <div className="audits-list">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="audit-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                  >
                    <div className="audit-time">{new Date(tx.created_at).toLocaleString()}</div>
                    <div className="audit-action">{tx.reference}</div>
                    <div className="audit-details">
                      {tx.amount} {tx.currency} · {tx.transaction_type}
                    </div>
                    <span className={`badge badge-${tx.status.toLowerCase()}`}>
                      {tx.status}
                    </span>
                    <span className={`risk-${tx.risk_score > 70 ? 'high' : tx.risk_score > 30 ? 'medium' : 'low'}`}>
                      {tx.risk_score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ color: '#fff', background: 'rgba(15,23,42,0.95)' }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ background: 'rgba(15,23,42,0.95)', color: '#fff' }}>
          Are you sure you want to delete customer <strong>{customer.name}</strong>? This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(15,23,42,0.95)', pb: 2, px: 3 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</Button>
          <Button onClick={handleDelete} disabled={deleting} variant="contained" color="error">
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}