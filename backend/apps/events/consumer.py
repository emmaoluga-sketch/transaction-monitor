import redis
import json
import time
from django.conf import settings
from transactions.models import Transaction
from rules.engine import RuleEngine
from audits.models import AuditLog

def consume_events():
    r = redis.Redis.from_url(settings.REDIS_URL)
    last_id = '0'
    
    print("🚀 Event consumer started. Waiting for transactions...")
    
    while True:
        try:
            messages = r.xread({'transaction_stream': last_id}, count=10, block=5000)
            for stream, entries in messages:
                for entry_id, fields in entries:
                    event_json = fields[b'event'].decode()
                    event_data = json.loads(event_json)
                    transaction_id = event_data['transaction_id']
                    
                    print(f"📥 Processing transaction {transaction_id}")
                    
                    try:
                        transaction = Transaction.objects.get(id=transaction_id)
                        risk_increment, alerts = RuleEngine.evaluate(transaction)
                        transaction.risk_score = min(100, transaction.risk_score + risk_increment)
                        transaction.save()
                        
                        AuditLog.objects.create(
                            transaction=transaction,
                            action='RULE_ENGINE_EVALUATION',
                            details={
                                'risk_increment': risk_increment,
                                'alerts_created': [{'id': a.id, 'rule': a.rule_name} for a in alerts],
                            },
                            user=None,
                        )
                        
                        print(f"✅ Transaction {transaction_id} processed. Risk: {transaction.risk_score}")
                    except Transaction.DoesNotExist:
                        print(f"❌ Transaction {transaction_id} not found")
                    last_id = entry_id
        except Exception as e:
            print(f"⚠️ Consumer error: {e}")
            time.sleep(1)