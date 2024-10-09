from rest_framework import serializers
from media.models import Media
from album.models import Album

class MediaSerializer(serializers.ModelSerializer):
    album = serializers.SerializerMethodField()
    
    class Meta:
        model = Media
        fields = ['id', 'album', 'file', 'media_type', 'description', 'tags', 'approval_status']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_album(self, obj):
        return obj.album.title if obj.album else None
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        
        if not request or not request.user.is_authenticated:
            ret.pop('approval_status', None)
        return ret
    
    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            data.pop('approval_status', None)
            ret.pop('approval_status', None)
        return ret
    
    def __init__(self, *args, **kwargs):
        # Capture the request to check if it's for update or create
        self.is_update = kwargs.pop('is_update', False)
        super().__init__(*args, **kwargs)
        
        # Conditionally set the required fields
        if self.is_update:
            self.fields['file'].required = False
            self.fields['media_type'].required = False

    
    def validate(self, attrs):
        request = self.context.get('request')
        view = self.context.get('view')
        sharelink_uuid = view.kwargs.get('sharelink') if view else None

        # Check if the album exists using the sharelink UUID
        try:
            album = Album.objects.get(sharelink=sharelink_uuid)
        except Album.DoesNotExist:
            raise serializers.ValidationError('Album does not exist')
        
        # Check if the media file is in the allowed formats
        allowed_formats = ['image', 'video', 'link']
        if attrs.get('media_type') and attrs.get('media_type') not in allowed_formats:
            raise serializers.ValidationError('Unsupported media type')
        
        # Check if the media file size is within the allowed limits
        max_size = 10 * 1024 * 1024  # 10MB
        if attrs.get('file') and attrs.get('file').size > max_size:
            raise serializers.ValidationError('File size exceeds the allowed limit size 10 MB')
        
        # Attach the album to the attrs for saving later
        attrs['album'] = album
        
        return attrs
    def create(self, validated_data):
        # Remove 'approval_status' from validated_data for creation
        validated_data.pop('approval_status', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.description = validated_data.get('description', instance.description)
        instance.tags = validated_data.get('tags', instance.tags)
        instance.approval_status = validated_data.get('approval_status', instance.approval_status)
        instance.save()
        return instance

