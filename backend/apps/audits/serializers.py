from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ['id', 'transaction', 'action', 'details', 'user', 'created_at']
        read_only_fields = ['id', 'created_at']