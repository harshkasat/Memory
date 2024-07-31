from django.contrib import admin
from .models import CustomUser, Album, Media, Notification, TempMedia
# Register your models here.

admin.site.register(CustomUser)
admin.site.register(Album)
admin.site.register(Media)
admin.site.register(Notification)
admin.site.register(TempMedia)