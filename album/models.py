import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone
from account.models import CustomUser

class BaseModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
# Create your models here.
class Album(BaseModel):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='albums')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    sharelink = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    privacy_settings = models.CharField(max_length=10, choices=[('public', 'Public'), ('private', 'Private')], default='private')
    cover_image = models.ImageField(upload_to='cover_images/', blank=True)

    def __str__(self):
        return self.title