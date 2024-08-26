from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

# Create your views here.
class RegisterView(APIView):

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
                'user_id': serializer.data['uuid']  # Assuming the primary key is `uuid`
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'data': str(e),  # Convert exception to string
                'message': "Something went wrong",
            }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        
        try:
            
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
                login(request, user)
                return Response({"message": "Logged in successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)


from rest_framework.permissions import IsAuthenticated
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

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