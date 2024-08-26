from django.urls import path, include
from account import views


urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('logout/', views.LogoutView.as_view()),
    path('user-info/', views.UserInfoView.as_view()),
]
