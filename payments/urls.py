# payments/urls.py
from django.urls import path
from .views import approve, create_upfront_payment

urlpatterns = [
    path("upfront/<int:project_id>/", create_upfront_payment),
    path("approve/<int:project_id>/", approve),
]
