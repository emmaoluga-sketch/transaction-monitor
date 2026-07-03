from rest_framework import serializers
from .models import Transaction
from customers.models import Customer
from customers.serializers import CustomerSerializer

class TransactionSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all())
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'reference', 'customer', 'customer_name', 'amount', 
            'currency', 'transaction_type', 'status', 'risk_score', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reference', 'risk_score', 'created_at', 'updated_at']

class TransactionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['status']
        read_only_fields = ['reference', 'customer', 'amount', 'currency', 'transaction_type', 'risk_score']