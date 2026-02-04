# submissions/urls.py

from django.urls import path
from .views import submit_demo

urlpatterns = [
   path('submit/<int:project_id>/',submit_demo),
]
