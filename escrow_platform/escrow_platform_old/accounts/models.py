from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    ROLE_CHOICES = [
        ('investor', 'Investor'),
        ('creator', 'Creator'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

