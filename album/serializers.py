from rest_framework import serializers
from .models import Album


class AlbumSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    cover_image = serializers.ImageField(use_url=True)
    class Meta:
        model = Album
        fields = ['id', 'title', 'description', 'cover_image', 'privacy_settings', 'sharelink', 'owner']
        read_only_fields = ['sharelink', 'owner_username', 'owner']

        
    def get_owner(self, obj):
        return obj.owner.username if obj.owner else None
