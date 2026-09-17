from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('upload/', views.upload, name='upload'),
    path('delete/<int:file_id>/', views.delete_file, name='delete_file'),

]