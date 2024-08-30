from django.shortcuts import render
from album.serializers import AlbumSerializer
from account.models import CustomUser
from album.models import Album
from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated


# Create your views here.



class AlbumListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AlbumSerializer

    def get_queryset(self):
        return Album.objects.filter(owner=self.request.user)

class AlbumCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AlbumSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class AlbumDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AlbumSerializer

    def get_queryset(self):
        return Album.objects.filter(owner=self.request.user)
