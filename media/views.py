from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import Album, Media
from .serializers import MediaSerializer

class MediaView(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        else:
            return [AllowAny()]

    def get(self, request, *args, **kwargs):
        try:
            data = request.data
            sharelink_uuid = kwargs.get('sharelink')
            if sharelink_uuid:
                albums = get_object_or_404(Album, sharelink=sharelink_uuid)
                all_media = Media.objects.filter(album=albums).all()
                serializer = MediaSerializer(all_media, many=True, context={'request': request})
                if serializer.is_valid():
                    return Response({
                        'data': serializer.data,
                        'message': 'Media content retrieved successfully'
                    }, status=200)
        except Album.DoesNotExist:
            return Response({'message': 'Album not found'}, status=404)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            sharelink_uuid = kwargs.get('sharelink')
            albums = get_object_or_404(Album, sharelink=sharelink_uuid)

            serializer = MediaSerializer(data=data, context={'request': request, 'view': self})

            if serializer.is_valid():
                serializer.save(album=albums)
                return Response({
                    'data': serializer.data,
                    'message': 'Media content added successfully'
                }, status=201)
            else:
                return Response(serializer.errors, status=400)
        except Album.DoesNotExist:
            return Response({'message': 'Album not found'}, status=404)
