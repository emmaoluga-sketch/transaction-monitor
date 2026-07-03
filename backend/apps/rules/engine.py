from .rules import (
    HighAmountRule,
    FrequentTransactionsRule,
    BlacklistedCountryRule,
    HighRiskCustomerRule
)

from alerts.models import Alert
from audits.models import AuditLog
from django.contrib.auth import get_user_model

User = get_user_model()

class RuleEngine:
    _rules = [
        HighAmountRule(),
        FrequentTransactionsRule(),
        BlacklistedCountryRule(),
        HighRiskCustomerRule(),
    ]

    @classmethod
    def evaluate(cls, transaction):
        from alerts.models import Alert
        from audits.models import AuditLog
        total_risk = 0
        alerts_created = []
        for rule in cls._rules:
            increment, message, triggered = rule.evaluate(transaction)
            if triggered:
                total_risk += increment
                alert = Alert.objects.create(
                    transaction=transaction,
                    rule_name=rule.name,
                    message=message,
                    severity=rule.severity,
                )
                alerts_created.append(alert)
        return total_risk, alerts_created