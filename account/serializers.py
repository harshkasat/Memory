from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.hashers import make_password, check_password
import re
password_criteria = [
"At least one uppercase letter",
"At least one lowercase letter",
"At least one digit",
"At least one special character",
"Minimum length of eight characters"
]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        extra_kwargs = {
            'password': {'write_only': True}
        }
        exclude = ['created_at', 'updated_at', 'user_permissions', 'groups']
    
    def validate(self, attrs):
        email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        password_regex = r'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'

        # Use .get() to safely access attributes
        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')

        if not username:
            raise serializers.ValidationError("Username is required")
        
        if not email:
            raise serializers.ValidationError("Email is required")

        if not password:
            raise serializers.ValidationError("Password is required")

        if CustomUser.objects.filter(username=username).exists():
            raise serializers.ValidationError("This username is already taken 🥲")
        
        if re.fullmatch(email_regex, email) is None:
            raise serializers.ValidationError("Enter a correct email address")

        if re.fullmatch(password_regex, password) is None:
            raise serializers.ValidationError({'password':password_criteria})

        attrs['password'] = make_password(password)

        return attrs

    def create(self, validated_data):
        user = CustomUser.objects.create(username = validated_data.get('username'),
            email = validated_data['email'],
            password = validated_data['password'],
            profile_picture = validated_data.get('profile_picture', None))
        
        return validated_data

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError("Username and password are required")
        
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
        if not check_password(password, user.password):
            raise serializers.ValidationError("Incorrect password")
        
        # Add the user to the validated data
        attrs['user'] = user
        return attrs

