from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="creator")
    investor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="investor")

    title = models.CharField(max_length=200)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    upfront_amount = models.DecimalField(max_digits=10, decimal_places=2)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)

    STATUS = [
        ('pending','Pending'),
        ('in_progress','In Progress'),
        ('submitted','Submitted'),
        ('completed','Completed'),
        ('disputed','Disputed'),
    ]

    status = models.CharField(max_length=20, choices=STATUS)
