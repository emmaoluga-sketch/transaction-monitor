from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from customers.models import Customer
from transactions.models import Transaction 

class TransactionAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        response = self.client.post('/api/v1/token/', {'username': 'testuser', 'password': 'testpass'})
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        # Create a test customer
        self.customer = Customer.objects.create(
            name='John Doe',
            email='john@example.com',
            phone='1234567890',
            address='123 Main St',
            country='USA'
        )

    def test_create_transaction(self):
        data = {
            'customer': self.customer.id,
            'amount': '1500.00',
            'currency': 'USD',
            'transaction_type': 'DEPOSIT'
        }
        response = self.client.post('/api/v1/transactions/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertIn('TXN-', response.data['reference'])
        self.assertEqual(response.data['status'], 'PENDING')
        self.assertEqual(response.data['risk_score'], 0)

    def test_list_transactions(self):
        Transaction.objects.create(
            reference='TXN-TEST001',
            customer=self.customer,
            amount='500.00',
            currency='USD',
            transaction_type='DEPOSIT'
        )
        response = self.client.get('/api/v1/transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_update_status(self):
        transaction = Transaction.objects.create(
            reference='TXN-TEST002',
            customer=self.customer,
            amount='200.00',
            currency='USD',
            transaction_type='WITHDRAWAL',
            status='PENDING'
        )
        response = self.client.patch(f'/api/v1/transactions/{transaction.id}/status/', {'status': 'COMPLETED'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        transaction.refresh_from_db()
        self.assertEqual(transaction.status, 'COMPLETED')