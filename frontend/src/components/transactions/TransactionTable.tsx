import { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import AddTransactionModal from './AddTransactionModal';

export default function TransactionTable() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', transaction_type: '' });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, pagination.pageSize, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/transactions/', {
        params: {
          page: pagination.page,
          page_size: pagination.pageSize,
          search: filters.search || undefined,
          status: filters.status || undefined,
          transaction_type: filters.transaction_type || undefined,
        },
      });
      setTransactions(response.data.results);
      setPagination(prev => ({ ...prev, total: response.data.count }));
    } catch (err) {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    PENDING: { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' },
    COMPLETED: { bg: 'rgba(74, 222, 128, 0.2)', color: '#4ade80' },
    FAILED: { bg: 'rgba(248, 113, 113, 0.2)', color: '#f87171' },
    FLAGGED: { bg: 'rgba(251, 146, 60, 0.2)', color: '#fb923c' },
  };

  const riskColors = (score: number) => {
    if (score > 70) return '#f87171';
    if (score > 30) return '#fbbf24';
    return '#4ade80';
  };

  const columns: GridColDef[] = [
    { field: 'reference', headerName: 'Reference', flex: 1.5, minWidth: 150 },
    { field: 'customer_name', headerName: 'Customer', flex: 1.5, minWidth: 150 },
    { field: 'amount', headerName: 'Amount', flex: 1, minWidth: 100 },
    { field: 'currency', headerName: 'Currency', flex: 0.8, minWidth: 80 },
    { field: 'transaction_type', headerName: 'Type', flex: 1, minWidth: 120 },
    {
  field: 'status',
  headerName: 'Status',
  flex: 1,
  minWidth: 120,
  renderCell: (params) => {
    const statusColors: Record<string, { bg: string; color: string }> = {
      PENDING: { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' },
      COMPLETED: { bg: 'rgba(74, 222, 128, 0.2)', color: '#4ade80' },
      FAILED: { bg: 'rgba(248, 113, 113, 0.2)', color: '#f87171' },
      FLAGGED: { bg: 'rgba(251, 146, 60, 0.2)', color: '#fb923c' },
    };
    const style = statusColors[params.value as string] || statusColors.PENDING;
    return (
      <span style={{
        display: 'inline-block',
        padding: '0.2rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        backgroundColor: style.bg,
        color: style.color,
      }}>
        {params.value}
      </span>
    );
  }
},
    {
      field: 'risk_score',
      headerName: 'Risk Score',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span style={{ color: riskColors(params.value), fontWeight: 600 }}>
          {params.value}%
        </span>
      )
    },
    { field: 'created_at', headerName: 'Created', flex: 1.5, minWidth: 150 },
  ];

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
        <button onClick={fetchTransactions} className="table-refresh">Retry</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="table-toolbar">
        <div className="table-search">
          <input
            type="text"
            placeholder="Search by reference or customer..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div className="table-filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="FLAGGED">Flagged</option>
          </select>
          <select
            value={filters.transaction_type}
            onChange={(e) => setFilters(prev => ({ ...prev, transaction_type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
        <button onClick={() => setModalOpen(true)} className="table-refresh" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none' }}>
          + Add Transaction
        </button>
        <button onClick={fetchTransactions} className="table-refresh">Refresh</button>
      </div>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={transactions}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={pagination.total}
          pageSizeOptions={[10, 20, 50]}
          paginationModel={{ page: pagination.page - 1, pageSize: pagination.pageSize }}
          onPaginationModelChange={(model) => {
            setPagination(prev => ({ ...prev, page: model.page + 1, pageSize: model.pageSize }));
          }}
          onRowClick={(params) => navigate(`/transactions/${params.id}`)}
          sx={{
            cursor: 'pointer',
            '& .MuiDataGrid-root': { border: 'none' },
            '& .MuiDataGrid-cell': { 
              color: 'rgba(255,255,255,0.8)', 
              borderColor: 'rgba(255,255,255,0.05)',
              fontSize: '0.85rem',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)'
            },
            '& .MuiTablePagination-root': { color: 'rgba(255,255,255,0.6)' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
          }}
        />
      </div>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </motion.div>
  );
}