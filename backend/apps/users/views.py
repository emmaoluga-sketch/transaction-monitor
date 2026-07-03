from rest_framework import viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer

# This is just a placeholder. We don't actually need a view for users 
# because authentication is handled by JWT token endpoints.
# But we keep it for completeness.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer