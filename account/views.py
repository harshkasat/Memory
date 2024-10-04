from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate, login, logout
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenRefreshView




class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

# Create your views here.
class RegisterView(APIView):
    def check_permissions(self, request):
        if request.method == 'GET':
            permission_classes = [IsAdminUser]
            for permission in permission_classes:
                if not permission().has_permission(request, self):
                    self.permission_denied(
                        request,
                        message=getattr(permission, 'message', None)
                    )

    def post(self, request):
        try:
            data = request.data
            serializer = RegisterSerializer(data=data)  # Use data=data to properly initialize the serializer

            # Check if the serializer data is valid
            if not serializer.is_valid():
                return Response({
                    'data': serializer.errors,
                    'message': "Something went wrong",
                }, status=status.HTTP_400_BAD_REQUEST)

            # Save the valid data
            serializer.save()

            return Response({
                'data': {},
                'message': "User created successfully",
                'user_id': serializer.data  # Assuming the primary key is `uuid`
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'data': str(e),  # Convert exception to string
                'message': "Something went wrong",
            }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        
        try:
            self.check_permissions(request)
            data = CustomUser.objects.all()
            serializer = RegisterSerializer(data, many=True)

            return Response({
                'data': serializer.data,  # Return serialized data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'data': str(e),  # Convert exception to string
                'message': "Something went wrong",
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                # login(request, user)
                # If the credentials are valid, create JWT tokens
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                
                # Return the tokens to the client
                return Response({
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "message": "Logged in successfully"
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def get(self, request):
        logout(request)
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        from django.middleware.csrf import get_token
        csrf_token = get_token(request)
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "is_authenticated": user.is_authenticated,
            'csrf_token': csrf_token,
        }, status=status.HTTP_200_OK)