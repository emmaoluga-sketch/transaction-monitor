import os
import sys
import django
from django.test.utils import get_runner

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

TestRunner = get_runner(django.conf.settings)
test_runner = TestRunner()
failures = test_runner.run_tests(['apps.customers.tests', 'apps.transactions.tests', 'apps.rules.tests', 'apps.users.tests'])
sys.exit(failures)