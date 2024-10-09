from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from media.models import Media
from album.models import Album
from .serializers import MediaSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


@method_decorator(csrf_exempt, name='dispatch')
class MediaView(APIView):
    authentication_classes = [JWTAuthentication]
    
    def get_permissions(self):
        method_allowed = ['GET', 'DELETE', 'PUT']
        if self.request.method in method_allowed:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self, album, search_query='', media_type=None, status=None):
        queryset = Media.objects.filter(album=album)
        
        if search_query:
            queryset = queryset.filter(
                Q(description__icontains=search_query) |
                Q(tags__icontains=search_query)
            )
        
        if media_type and media_type != 'all':
            queryset = queryset.filter(media_type=media_type)
            
        if status and status != 'all':
            queryset = queryset.filter(approval_status=status)
            
        return queryset

    def get(self, request, *args, **kwargs):
        try:
            sharelink_uuid = kwargs.get('sharelink')
            if not sharelink_uuid:
                return Response({
                    'message': 'Sharelink is required'
                }, status=400)

            album = get_object_or_404(Album, sharelink=sharelink_uuid)
            
            # Get query parameters for filtering
            search_query = request.query_params.get('search', '')
            media_type = request.query_params.get('media_type')
            status = request.query_params.get('status')

            queryset = self.get_queryset(
                album=album,
                search_query=search_query,
                media_type=media_type,
                status=status
            )

            serializer = MediaSerializer(queryset, many=True, context={'request': request})

            return Response({
                'data': serializer.data,
                'message': 'Media content retrieved successfully'
            }, status=200)

        except Album.DoesNotExist:
            return Response({'message': 'Album not found'}, status=404)
        except Exception as e:
            return Response({
                'message': f'An error occurred: {str(e)}'
            }, status=500)

    def post(self, request, *args, **kwargs):
        try:
            sharelink_uuid = kwargs.get('sharelink')
            if not sharelink_uuid:
                return Response({
                    'message': 'Sharelink is required'
                }, status=400)

            album = get_object_or_404(Album, sharelink=sharelink_uuid)
                        
            serializer = MediaSerializer(
                data=request.data, 
                context={'request': request, 'view': self}
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    'data': serializer.data,
                    'message': 'Media content added successfully'
                }, status=201)
            else:
                return Response({
                    'message': serializer.errors['non_field_errors'][0],
                }, status=400)


        except Album.DoesNotExist:
            return Response({'message': 'Album not found'}, status=404)
        except Exception as e:
            return Response({
                'message': f'An error occurred: {str(e)}'
            }, status=500)

    def delete(self, request, sharelink=None, media_id=None, *args, **kwargs):
        try:
            if not media_id:
                return Response({
                    'message': 'Media ID is required'
                }, status=400)
            print()
            album = get_object_or_404(Album, sharelink=sharelink)
            media = get_object_or_404(Media, id=media_id, album=album)
            media.delete()

            return Response({
                'message': 'Media deleted successfully'
            }, status=204)

        except (Album.DoesNotExist, Media.DoesNotExist):
            return Response({'message': 'Resource not found'}, status=404)
        except Exception as e:
            return Response({
                'message': f'An error occurred: {str(e)}'
            }, status=500)

    def put(self, request, sharelink=None, media_id=None, *args, **kwargs):
        try:
            if not media_id:
                return Response({'message': 'Media ID is required'}, status=400)

            album = get_object_or_404(Album, sharelink=sharelink)
            media = get_object_or_404(Media, id=media_id, album=album)

            print("PUT request data:", request.data)  # Debugging

            serializer = MediaSerializer(
                media,
                data=request.data,
                context={'request': request, 'view': self},
                is_update=True  # Mark it as an update
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Media content updated successfully'}, status=200)
            else:
                print("Serializer errors:", serializer.errors)  # Debugging
                return Response({'message': serializer.errors['non_field_errors'][0]}, status=400)

        except Media.DoesNotExist:
            return Response({'message': 'Media not found'}, status=404)
        except Exception as e:
            return Response({'message': f'An error occurred: {str(e)}'}, status=500)
