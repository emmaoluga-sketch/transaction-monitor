import uuid
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction
from .serializers import TransactionSerializer, TransactionUpdateSerializer
from events.publisher import publish_transaction_event

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('customer').all()
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'transaction_type', 'customer__id']
    search_fields = ['reference', 'customer__name', 'customer__email']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'update_status':
            return TransactionUpdateSerializer
        return TransactionSerializer

    def perform_create(self, serializer):
        # Generate a unique reference
        reference = f"TXN-{uuid.uuid4().hex[:10].upper()}"
        transaction = serializer.save(
            reference=reference,
            status='PENDING',
            risk_score=0
        )
        # Publish event to Redis for async processing
        publish_transaction_event(transaction)

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        transaction = self.get_object()
        serializer = self.get_serializer(transaction, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Optional: If status is completed, you could add an audit log here
        return Response(serializer.data)