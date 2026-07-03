from django.core.management.base import BaseCommand
from events.consumer import consume_events

class Command(BaseCommand):
    help = 'Start the Redis Streams consumer for transaction events'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting event consumer...'))
        consume_events()