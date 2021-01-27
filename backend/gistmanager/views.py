from django.contrib.auth.models import User

from rest_framework import routers, serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from gistmanager.auth import TokenAuthentication

# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'is_staff']


class UserViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = User.objects.all()
    serializer_class = UserSerializer