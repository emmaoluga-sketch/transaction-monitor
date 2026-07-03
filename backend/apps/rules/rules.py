from django.utils import timezone
from datetime import timedelta
from .base_rule import BaseRule

class HighAmountRule(BaseRule):
    """Rule: Transactions above $10,000 trigger an alert."""
    name = "High Amount"
    severity = "HIGH"

    def evaluate(self, transaction):
        if transaction.amount > 10000:
            return 50, f"Transaction amount ${transaction.amount:,.2f} exceeds $10,000", True
        return 0, "", False


class FrequentTransactionsRule(BaseRule):
    """Rule: More than 5 transactions in the last hour triggers an alert."""
    name = "Frequent Transactions"
    severity = "MEDIUM"

    def evaluate(self, transaction):
        one_hour_ago = timezone.now() - timedelta(hours=1)
        transaction_count = transaction.customer.transactions.filter(
            created_at__gte=one_hour_ago
        ).count()
        
        if transaction_count > 5:
            return 30, f"More than 5 transactions ({transaction_count}) in the last hour", True
        return 0, "", False


class BlacklistedCountryRule(BaseRule):
    """Rule: Transactions from blacklisted countries trigger an alert."""
    name = "Blacklisted Country"
    severity = "HIGH"
    BLACKLISTED_COUNTRIES = ["North Korea", "Iran", "Syria", "Cuba", "Russia"]

    def evaluate(self, transaction):
        if transaction.customer.country in self.BLACKLISTED_COUNTRIES:
            return 70, f"Customer from blacklisted country: {transaction.customer.country}", True
        return 0, "", False


class HighRiskCustomerRule(BaseRule):
    """Rule: High-risk customers trigger an alert."""
    name = "High Risk Customer"
    severity = "MEDIUM"

    def evaluate(self, transaction):
        if transaction.customer.is_high_risk:
            return 40, "Customer is marked as high risk", True
        return 0, "", False