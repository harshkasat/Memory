import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractBaseUser):
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Lengthened for hashed passwords
    profile_picture = models.ImageField(upload_to='profile_picture/', blank=True)
    data_joined = models.DateField(default=timezone.now)
    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

class Album(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='albums')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateField(default=timezone.now)
    updated_at = models.DateField(auto_now=True)
    sharelink = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    privacy_settings = models.CharField(max_length=10, choices=[('public', 'Public'), ('private', 'Private')], default='private')
    cover_image = models.ImageField(upload_to='cover_images/', blank=True)

    def __str__(self):
        return self.title

class Media(models.Model):

    MEDIA_TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
        ('link', 'Link')
    )
    APPROVAL_STATUS = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    )

    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='media/')
    media_type = models.CharField(max_length=5, choices=MEDIA_TYPE_CHOICES)
    updated_at = models.DateField(auto_now=True)
    approval_status = models.CharField(max_length=10, choices=APPROVAL_STATUS, default='pending')
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f'{self.media_type.capitalize()} in {self.album.title}'

class TempMedia(models.Model):
    MEDIA_TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
        ('link', 'Link')
    )
    album = models.ForeignKey(Album, on_delete=models.CASCADE, default=None)
    sharelink = models.CharField(max_length=255, blank=True)
    # uploader = models.CharField(max_length=20,null=True, blank=True)
    file = models.FileField(upload_to='temp_media/')
    media_type = models.CharField(max_length=5, choices=MEDIA_TYPE_CHOICES)
    created_at = models.DateField(auto_now_add=True)
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=255, blank=True)
    approval_status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending')

    def __str__(self):
        return f'{self.media_type.capitalize()} in {self.album.title}'

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=80, blank=True)

    def __str__(self):
        return self.message
