from django.contrib import admin
from .models import UploadedFile

@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'uploaded_at', 'size', 'content_type')
    ordering = ('-uploaded_at',)
    