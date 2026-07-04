from django.db import models
from django.contrib.auth import get_user_model
from transactions.models import Transaction

User = get_user_model()

class AuditLog(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='audits')
    action = models.CharField(max_length=100)  # e.g., "RULE_ENGINE_EVALUATION", "STATUS_UPDATE"
    details = models.JSONField(default=dict)   # Flexible JSON storage for any extra info
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'audits'
        indexes = [
            models.Index(fields=['transaction', 'created_at']),
            models.Index(fields=['action']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} - {self.transaction.reference}"