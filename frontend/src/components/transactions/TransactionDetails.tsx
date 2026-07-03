import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/client";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Trash2 } from "lucide-react";

interface Transaction {
  id: number;
  reference: string;
  customer: number;
  customer_name: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  risk_score: number;
  created_at: string;
  updated_at: string;
}

interface Alert {
  id: number;
  rule_name: string;
  message: string;
  severity: string;
  created_at: string;
  resolved: boolean;
}

interface AuditLog {
  id: number;
  action: string;
  details: any;
  created_at: string;
}

export default function TransactionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch transaction details
      const txResponse = await api.get(`/transactions/${id}/`);
      setTransaction(txResponse.data);

      // Fetch alerts for this transaction
      const alertsResponse = await api.get("/alerts/", {
        params: { transaction: id },
      });
      setAlerts(alertsResponse.data.results || []);

      // Fetch audit logs for this transaction
      const auditsResponse = await api.get("/audits/", {
        params: { transaction: id },
      });
      setAudits(auditsResponse.data.results || []);
    } catch (err) {
      setError("Failed to load transaction details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !transaction) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/transactions/${transaction.id}/status/`, {
        status: newStatus,
      });
      // Refresh data
      await fetchData();
      setNewStatus("");
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/transactions/${id}/`);
      navigate("/transactions");
    } catch (err) {
      console.error("Failed to delete transaction", err);
      setError("Failed to delete transaction.");
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="details-container">
        <div className="details-card">
          <div className="text-center text-white/40 py-12">
            Loading transaction details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="details-container">
        <div className="details-card">
          <div className="text-center text-red-400 py-12">
            {error || "Transaction not found"}
          </div>
          <button
            onClick={() => navigate("/transactions")}
            className="back-btn"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      PENDING: "badge-pending",
      COMPLETED: "badge-completed",
      FAILED: "badge-failed",
      FLAGGED: "badge-flagged",
    };
    return `badge ${classes[status as keyof typeof classes] || "badge-pending"}`;
  };

  const getSeverityBadge = (severity: string) => {
    const classes = {
      HIGH: "severity-high",
      MEDIUM: "severity-medium",
      LOW: "severity-low",
    };
    return `severity-badge ${classes[severity as keyof typeof classes] || "severity-medium"}`;
  };

  const getRiskLevel = (score: number) => {
    if (score > 70) return "risk-high";
    if (score > 30) return "risk-medium";
    return "risk-low";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="details-container"
    >
      <div className="details-card">
        {/* Header with Back button and Refresh */}
        <div className="details-header">
          <button
            onClick={() => navigate("/transactions")}
            className="back-btn"
          >
            <ArrowLeft size={18} />
            <span>Back to Transactions</span>
          </button>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={fetchData} className="refresh-btn">
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="refresh-btn"
              style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="details-body">
          <div className="details-section">
            <h2 className="section-title">Transaction Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Reference</label>
                <span className="info-value highlight">
                  {transaction.reference}
                </span>
              </div>
              <div className="info-item">
                <label>Customer</label>
                <span className="info-value">{transaction.customer_name}</span>
              </div>
              <div className="info-item">
                <label>Amount</label>
                <span className="info-value">
                  {transaction.amount} {transaction.currency}
                </span>
              </div>
              <div className="info-item">
                <label>Type</label>
                <span className="info-value">
                  {transaction.transaction_type}
                </span>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span className={getStatusBadge(transaction.status)}>
                  {transaction.status}
                </span>
              </div>
              <div className="info-item">
                <label>Risk Score</label>
                <span
                  className={`info-value ${getRiskLevel(transaction.risk_score)}`}
                >
                  {transaction.risk_score}%
                </span>
              </div>
              <div className="info-item">
                <label>Created</label>
                <span className="info-value">
                  {new Date(transaction.created_at).toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <span className="info-value">
                  {new Date(transaction.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="details-section update-section">
            <h3 className="section-subtitle">Update Status</h3>
            <div className="status-update-row">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="status-select"
              >
                <option value="">Select new status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="FLAGGED">Flagged</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || updatingStatus}
                className="update-btn"
              >
                {updatingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="details-section">
            <h3 className="section-subtitle">Alerts ({alerts.length})</h3>
            {alerts.length === 0 ? (
              <div className="empty-state">No alerts for this transaction.</div>
            ) : (
              <div className="alerts-list">
                {alerts.map((alert) => (
                  <div key={alert.id} className="alert-item">
                    <div className="alert-icon">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="alert-content">
                      <div className="alert-header">
                        <span className="alert-rule">{alert.rule_name}</span>
                        <span className={getSeverityBadge(alert.severity)}>
                          {alert.severity}
                        </span>
                      </div>
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-meta">
                        <span>
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                        <span
                          className={`alert-status ${alert.resolved ? "resolved" : "active"}`}
                        >
                          {alert.resolved ? "Resolved" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Logs */}
          <div className="details-section">
            <h3 className="section-subtitle">Audit Logs ({audits.length})</h3>
            {audits.length === 0 ? (
              <div className="empty-state">
                No audit logs for this transaction.
              </div>
            ) : (
              <div className="audits-list">
                {audits.map((log) => (
                  <div key={log.id} className="audit-item">
                    <div className="audit-time">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    <div className="audit-action">{log.action}</div>
                    <div className="audit-details">
                      <code>{JSON.stringify(log.details, null, 2)}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle sx={{ color: "#fff", background: "rgba(15,23,42,0.95)" }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent
          sx={{ background: "rgba(15,23,42,0.95)", color: "#fff" }}
        >
          Are you sure you want to delete transaction{" "}
          <strong>{transaction?.reference}</strong>? This action cannot be
          undone.
        </DialogContent>
        <DialogActions sx={{ background: "rgba(15,23,42,0.95)", pb: 2, px: 3 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ color: "rgba(255,255,255,0.6)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="contained"
            color="error"
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
