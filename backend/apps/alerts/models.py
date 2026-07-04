from django.db import models
from transactions.models import Transaction

class Alert(models.Model):
    SEVERITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    )
    
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='alerts')
    rule_name = models.CharField(max_length=100)
    message = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MEDIUM')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    class Meta:
        app_label = 'alerts'  # <-- ADD THIS
        indexes = [
            models.Index(fields=['transaction', 'created_at']),
            models.Index(fields=['resolved']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rule_name} - {self.transaction.reference}"