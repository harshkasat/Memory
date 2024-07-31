from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from user import views

urlpatterns = [
    path('approval/', views.MediaApprovalDetail.as_view()),
    path('approval/<int:pk>/', views.MediaApprovalDetail.as_view()),
    path('media/<uuid:sharelink>/', views.TempMediaBySharelinkView.as_view(), name='media-by-sharelink'),
]

urlpatterns = format_suffix_patterns(urlpatterns)