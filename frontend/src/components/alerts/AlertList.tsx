import { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import api from '../../api/client';

export default function AlertList() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });

  useEffect(() => {
    fetchAlerts();
  }, [pagination.page, pagination.pageSize]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/alerts/', {
        params: { page: pagination.page, page_size: pagination.pageSize },
      });
      setAlerts(response.data.results);
      setPagination(prev => ({ ...prev, total: response.data.count }));
    } catch (err) {
      setError('Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'rule_name', headerName: 'Rule', flex: 1.5, minWidth: 150 },
    { field: 'message', headerName: 'Message', flex: 2, minWidth: 200 },
    { field: 'transaction_reference', headerName: 'Transaction', flex: 1, minWidth: 120 },
    {
      field: 'severity',
      headerName: 'Severity',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className={`badge ${params.value === 'HIGH' ? 'badge-flagged' : params.value === 'MEDIUM' ? 'badge-pending' : 'badge-completed'}`}>
          {params.value}
        </span>
      )
    },
    {
      field: 'resolved',
      headerName: 'Status',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className={`alert-status ${params.value ? 'resolved' : 'active'}`}>
          {params.value ? 'Resolved' : 'Active'}
        </span>
      )
    },
    { field: 'created_at', headerName: 'Created', flex: 1.5, minWidth: 150 },
  ];

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
        <button onClick={fetchAlerts} className="table-refresh">Retry</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="table-toolbar" style={{ justifyContent: 'flex-end' }}>
        <button onClick={fetchAlerts} className="table-refresh">Refresh</button>
      </div>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={alerts}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={pagination.total}
          pageSizeOptions={[10, 20, 50]}
          paginationModel={{ page: pagination.page - 1, pageSize: pagination.pageSize }}
          onPaginationModelChange={(model) => {
            setPagination(prev => ({ ...prev, page: model.page + 1, pageSize: model.pageSize }));
          }}
          sx={{
            '& .MuiDataGrid-root': { border: 'none' },
            '& .MuiDataGrid-cell': { color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.05)' },
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
    </motion.div>
  );
}