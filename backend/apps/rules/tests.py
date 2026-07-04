from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from customers.models import Customer
from transactions.models import Transaction
from rules.rules import (
    HighAmountRule,
    FrequentTransactionsRule,
    BlacklistedCountryRule,
    HighRiskCustomerRule
)
from rules.engine import RuleEngine


class RuleTests(TestCase):
    def setUp(self):
        # Create a test customer
        self.customer = Customer.objects.create(
            name='Test Customer',
            email='test@example.com',
            phone='1234567890',
            address='123 Test St',
            country='USA',
            is_high_risk=False
        )

    def test_high_amount_rule_triggered(self):
        transaction = Transaction.objects.create(
            reference='TXN-TEST001',
            customer=self.customer,
            amount=15000.00,
            currency='USD',
            transaction_type='DEPOSIT'
        )
        rule = HighAmountRule()
        increment, message, triggered = rule.evaluate(transaction)
        self.assertTrue(triggered)
        self.assertEqual(increment, 50)
        self.assertIn('exceeds', message)

    def test_high_amount_rule_not_triggered(self):
        transaction = Transaction.objects.create(
            reference='TXN-TEST002',
            customer=self.customer,
            amount=5000.00,
            currency='USD',
            transaction_type='DEPOSIT'
        )
        rule = HighAmountRule()
        increment, message, triggered = rule.evaluate(transaction)
        self.assertFalse(triggered)
        self.assertEqual(increment, 0)

    def test_frequent_transactions_rule(self):
        # Create 6 transactions in the last 30 minutes
        now = timezone.now()
        for i in range(6):
            Transaction.objects.create(
                reference=f'TXN-FREQ-{i}',
                customer=self.customer,
                amount=100.00,
                currency='USD',
                transaction_type='DEPOSIT',
                created_at=now - timedelta(minutes=30 - i * 5)
            )
        # The 7th transaction should trigger the rule
        transaction = Transaction.objects.create(
            reference='TXN-FREQ-007',
            customer=self.customer,
            amount=100.00,
            currency='USD',
            transaction_type='DEPOSIT',
            created_at=timezone.now()
        )
        rule = FrequentTransactionsRule()
        increment, message, triggered = rule.evaluate(transaction)
        self.assertTrue(triggered)
        self.assertEqual(increment, 30)

    def test_blacklisted_country_rule(self):
        blacklisted_customer = Customer.objects.create(
            name='Bad Customer',
            email='bad@example.com',
            phone='9999999999',
            address='123 Bad St',
            country='North Korea'
        )
        transaction = Transaction.objects.create(
            reference='TXN-BLACK',
            customer=blacklisted_customer,
            amount=1000.00,
            currency='USD',
            transaction_type='DEPOSIT'
        )
        rule = BlacklistedCountryRule()
        increment, message, triggered = rule.evaluate(transaction)
        self.assertTrue(triggered)
        self.assertEqual(increment, 70)
        self.assertIn('blacklisted', message.lower())

    def test_high_risk_customer_rule(self):
        risky_customer = Customer.objects.create(
            name='Risky Customer',
            email='risky@example.com',
            phone='8888888888',
            address='123 Risky St',
            country='USA',
            is_high_risk=True
        )
        transaction = Transaction.objects.create(
            reference='TXN-RISK',
            customer=risky_customer,
            amount=1000.00,
            currency='USD',
            transaction_type='DEPOSIT'
        )
        rule = HighRiskCustomerRule()
        increment, message, triggered = rule.evaluate(transaction)
        self.assertTrue(triggered)
        self.assertEqual(increment, 40)
        self.assertIn('high risk', message.lower())

    def test_engine_runs_all_rules(self):
        # Create a risky transaction that should trigger multiple rules
        risky_customer = Customer.objects.create(
            name='Very Risky Customer',
            email='veryrisky@example.com',
            phone='7777777777',
            address='123 Very Risky St',
            country='Iran',
            is_high_risk=True
        )
        transaction = Transaction.objects.create(
            reference='TXN-MULTI',
            customer=risky_customer,
            amount=20000.00,
            currency='USD',
            transaction_type='DEPOSIT'
        )
        total_risk, alerts = RuleEngine.evaluate(transaction)
        # Should trigger: HighAmount (50) + BlacklistedCountry (70) + HighRiskCustomer (40)
        # FrequentTransactions should NOT trigger (only 1 transaction)
        self.assertEqual(total_risk, 160)
        self.assertEqual(len(alerts), 3)