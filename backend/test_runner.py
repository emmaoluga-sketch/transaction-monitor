import sys
import os
from django.test.runner import DiscoverRunner

class CustomTestRunner(DiscoverRunner):
    def build_suite(self, test_labels=None, extra_tests=None, **kwargs):
        # Ensure apps folder is in path for test discovery
        apps_path = os.path.join(os.path.dirname(__file__), 'apps')
        if apps_path not in sys.path:
            sys.path.insert(0, apps_path)
        return super().build_suite(test_labels, extra_tests, **kwargs)