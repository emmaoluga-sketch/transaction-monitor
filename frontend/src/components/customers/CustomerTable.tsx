import { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import AddCustomerModal from './AddCustomerModal';

export default function CustomerTable() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, pagination.pageSize, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/customers/', {
        params: { page: pagination.page, page_size: pagination.pageSize, search: search || undefined },
      });
      setCustomers(response.data.results);
      setPagination(prev => ({ ...prev, total: response.data.count }));
    } catch (err) {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1.5, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 180 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 120 },
    { field: 'country', headerName: 'Country', flex: 1, minWidth: 120 },
    {
      field: 'is_high_risk',
      headerName: 'Risk',
      flex: 0.8,
      minWidth: 80,
      renderCell: (params) => (
        <span style={{
          display: 'inline-block',
          padding: '0.2rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          backgroundColor: params.value ? 'rgba(248, 113, 113, 0.2)' : 'rgba(74, 222, 128, 0.2)',
          color: params.value ? '#f87171' : '#4ade80',
        }}>
          {params.value ? 'HIGH' : 'LOW'}
        </span>
      )
    },
    { field: 'created_at', headerName: 'Joined', flex: 1.5, minWidth: 150 },
  ];

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
        <button onClick={fetchCustomers} className="table-refresh">Retry</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="table-toolbar">
        <div className="table-search" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="table-refresh"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            border: 'none',
          }}
        >
          + Add Customer
        </button>
        <button onClick={fetchCustomers} className="table-refresh">Refresh</button>
      </div>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={customers}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={pagination.total}
          pageSizeOptions={[10, 20, 50]}
          paginationModel={{ page: pagination.page - 1, pageSize: pagination.pageSize }}
          onPaginationModelChange={(model) => {
            setPagination(prev => ({ ...prev, page: model.page + 1, pageSize: model.pageSize }));
          }}
          onRowClick={(params) => navigate(`/customers/${params.id}`)}
          sx={{
            cursor: 'pointer',
            '& .MuiDataGrid-root': { border: 'none' },
            '& .MuiDataGrid-cell': {
              color: 'rgba(255,255,255,0.8)',
              borderColor: 'rgba(255,255,255,0.05)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
            },
            '& .MuiTablePagination-root': { color: 'rgba(255,255,255,0.6)' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
          }}
        />
      </div>

      <AddCustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchCustomers}
      />
    </motion.div>
  );
}