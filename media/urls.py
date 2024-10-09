from django.urls import path
from media.views import MediaView



urlpatterns = [
    path('sharelink/<str:sharelink>/', MediaView.as_view(), name='media-list'),
    path('media/', MediaView.as_view(), name='media-create'),
    path('media/<str:sharelink>/<str:media_id>/', MediaView.as_view(), name='media-delete'),
]