from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework import generics, mixins
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import CustomUserSerializer, AlbumSerializer, MediaSerializer, MediaApprovalSerializer, TempMediaSerializer, TempMediaBySharelinkSerializer
from .models import CustomUser, Album, Media, Notification, TempMedia
# Create your views here.


class CustomViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def share(self, request, pk=None):
        album = self.get_object()
        return Response({'shareable_link': album.sharelink})

class TempMediaBySharelinkView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView
):
    serializer_class = TempMediaBySharelinkSerializer
    queryset = Media.objects.all()

    def get_queryset(self):
        sharelink = self.kwargs.get('sharelink')
        if sharelink:
            try:
                sharelink_uuid = (sharelink)
                album = get_object_or_404(Album, sharelink=sharelink_uuid)
                return TempMedia.objects.filter(album=album)
            except ValueError:
                return Media.objects.none()
        return Media.objects.none()

    def get_serializer(self, *args, **kwargs):
        sharelink = self.kwargs.get('sharelink')
        if sharelink:
            try:
                sharelink_uuid = (sharelink)
                album = get_object_or_404(Album, sharelink=sharelink_uuid)
                kwargs['context'] = self.get_serializer_context()
                kwargs['context']['album'] = album
                kwargs['album'] = album
            except ValueError:
                pass
        return super().get_serializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class MediaApprovalDetail(
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView
):
    queryset = TempMedia.objects.filter(approval_status='pending')
    serializer_class = MediaApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if pk:
            tempmedia = get_object_or_404(TempMedia, pk=pk)
            serializer = TempMediaSerializer(tempmedia, data=request.data, partial=True)
            if serializer.is_valid():
                return Response(serializer.data)
        return self.list(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        tempmedia = get_object_or_404(TempMedia, pk=pk)
        serializer = MediaApprovalSerializer(tempmedia, data=request.data, partial=True)

        if serializer.is_valid():
            approval_status = serializer.validated_data.get('approval_status', tempmedia.approval_status)

            if approval_status == 'approved':
                # Create Media instance
                media_data = {
                    'album': tempmedia.album_id,  # Use PK value for album
                    'file': tempmedia.file,
                    'media_type': tempmedia.media_type,
                    'description': tempmedia.description,
                    'tags': tempmedia.tags,
                    'approval_status': approval_status,
                }
                media_serializer = MediaSerializer(data=media_data)
                if media_serializer.is_valid():
                    media_serializer.save()
                    # Delete the TempMedia instance
                    tempmedia.delete()
                    # Create a notification
                    Notification.objects.create(
                        user=tempmedia.album.owner,
                        message=f"{tempmedia.media_type.capitalize()} has been approved by {request.user.username}."
                    )
                    return Response(media_serializer.data)
                else:
                    return Response(media_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            else:
                # If not approved, just update the TempMedia instance
                serializer.save()
                return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
