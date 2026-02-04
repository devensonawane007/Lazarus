from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from projects.models import Project
from .models import Submission


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_demo(request, project_id):

    project = Project.objects.get(id=project_id)

    if project.creator != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    demo = request.FILES.get("demo")
    note = request.data.get("note")

    if not demo:
        return Response({"error": "Demo file required"}, status=400)

    submission, created = Submission.objects.update_or_create(
        project=project,
        defaults={
            "demo": demo,
            "note": note
        }
    )

    project.status = "submitted"
    project.save()

    return Response({
        "submitted": True,
        "created": created
    })
