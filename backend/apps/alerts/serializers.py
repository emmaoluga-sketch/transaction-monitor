from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    transaction_reference = serializers.CharField(source='transaction.reference', read_only=True)

    class Meta:
        model = Alert
        fields = ['id', 'transaction', 'transaction_reference', 'rule_name', 'message', 'severity', 'created_at', 'resolved']