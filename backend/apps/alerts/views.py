from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Alert
from .serializers import AlertSerializer

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.select_related('transaction').all()
    serializer_class = AlertSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transaction', 'severity', 'resolved']  # <-- ADD 'transaction'
    search_fields = ['rule_name', 'message']
    ordering_fields = ['created_at']
    ordering = ['-created_at']