from django.db import models
from projects.models import Project


class Payment(models.Model):

    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    TYPE = [
        ('upfront','Upfront'),
        ('final','Final'),
    ]

    payment_type = models.CharField(max_length=20, choices=TYPE)

    STATUS = [
        ('held','Held'),
        ('paid','Paid'),
        ('failed','Failed'),
        ('refunded','Refunded'),
    ]

    status = models.CharField(max_length=20, choices=STATUS)

    finternet_txn_id = models.CharField(max_length=255)

