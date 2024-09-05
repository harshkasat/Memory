import os
from django.db import models
from album.models import Album
from django.utils import timezone

def get_upload_path(instance, filename):
    # Get the file extension
    ext = filename.split('.')[-1]
    # Create a new filename using the media type and original extension
    new_filename = f"{instance.media_type}.{ext}"
    # Return the full path
    return os.path.join('media', instance.media_type, instance.album.title, new_filename)

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
    file = models.FileField(upload_to=get_upload_path)
    media_type = models.CharField(max_length=5, choices=MEDIA_TYPE_CHOICES)
    approval_status = models.CharField(max_length=10, choices=APPROVAL_STATUS, default='pending')
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=255, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f'{self.album.title} in {self.media_type.capitalize()}'

    class Meta:
        verbose_name = 'Media Item'
        verbose_name_plural = 'Media Items'
        ordering = ['-updated_at']