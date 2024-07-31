from rest_framework.routers import DefaultRouter
from .views import CustomViewSet, AlbumViewSet

router = DefaultRouter()

router.register(r'createuser', CustomViewSet)
router.register(r'albums', AlbumViewSet, basename='album')