from django.urls import path
from media import views



urlpatterns = [
    path('sharelink/<uuid:sharelink>/', views.MediaView.as_view(), name='sharelink'),
]