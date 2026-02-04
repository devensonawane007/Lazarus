from django.db import models
from projects.models import Project
class Submission(models.Model):

    project = models.OneToOneField(Project, on_delete=models.CASCADE)

    demo = models.FileField(upload_to="demos/")
    note = models.TextField()

    approved = models.BooleanField(null=True)

# Create your models here.
