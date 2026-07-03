import redis
import json
from django.conf import settings

# Connect to Redis using the URL from settings
redis_client = redis.Redis.from_url(settings.REDIS_URL)

def publish_transaction_event(transaction):
    """
    Publish a transaction event to Redis Streams.
    This will be picked up by the consumer for async processing.
    """
    event_data = {
        'transaction_id': transaction.id,
        'reference': transaction.reference,
        'customer_id': transaction.customer_id,
        'amount': str(transaction.amount),
        'currency': transaction.currency,
        'transaction_type': transaction.transaction_type,
        'created_at': transaction.created_at.isoformat(),
    }
    
    # Add event to the stream called 'transaction_stream'
    redis_client.xadd('transaction_stream', {'event': json.dumps(event_data)})