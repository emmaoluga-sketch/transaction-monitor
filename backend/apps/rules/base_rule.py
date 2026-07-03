from abc import ABC, abstractmethod
from transactions.models import Transaction

class BaseRule(ABC):
    """
    Abstract base class for all rules.
    Every rule must implement the evaluate method.
    """
    name = "BaseRule"
    severity = "MEDIUM"  # LOW, MEDIUM, HIGH

    @abstractmethod
    def evaluate(self, transaction: Transaction):
        """
        Evaluate a transaction against this rule.
        
        Returns:
            tuple: (risk_score_increment, alert_message, triggered)
                - risk_score_increment: int (0-100)
                - alert_message: str (description of why it triggered)
                - triggered: bool (True if the rule was triggered)
        """
        pass