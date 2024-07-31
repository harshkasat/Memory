from rest_framework import serializers
from .models import CustomUser, Media, Album, TempMedia

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'profile_picture']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        read_only_fields = ['data_joined']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class MediaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Media
        fields = ['id', 'album', 'file', 'media_type', 'description', 'tags', 'approval_status']
        read_only_fields = ['created_at']

class TempMediaSerializer(serializers.ModelSerializer):
    album_title = serializers.ReadOnlyField(source='album.title')
    album = serializers.PrimaryKeyRelatedField(queryset=Album.objects.all())

    class Meta:
        model = TempMedia
        fields = ['id', 'album', 'album_title', 'file', 'media_type', 'description', 'tags', 'approval_status']
        read_only_fields = ['created_at']


class TempMediaBySharelinkSerializer(serializers.ModelSerializer):
    # album_title = serializers.ReadOnlyField(source='album.title')
    album = serializers.PrimaryKeyRelatedField(queryset=Album.objects.all())

    class Meta:
        model = TempMedia
        fields = ['id', 'album', 'file', 'media_type', 'description', 'tags']
        read_only_fields = ['created_at']
    
    def __init__(self, *args, **kwargs):
        album = kwargs.pop('album', None)
        super().__init__(*args, **kwargs)
        if album:
            self.fields['album'].queryset = Album.objects.filter(id=album.id)
    
    def validate_album(self, value):
        if 'album' in self.context and self.context['album'] != value:
            raise serializers.ValidationError("The album does not match the provided sharelink.")
        return value

    def create(self, validated_data):
        album = self.context['album']
        validated_data['album'] = album
        return super().create(validated_data)

class AlbumSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Album
        fields = ['id', 'title', 'description', 'owner', 'cover_image', 'media']
        read_only_fields = ['created_at', 'owner', 'sharelink']

class MediaApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = TempMedia
        fields = '__all__'
        read_only_fields = ['title','file', 'media_type', 'sharelink', 'created_at']
