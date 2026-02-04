from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.contrib.auth.models import User
from .models import Project


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_project(request):

    data = request.data

    title = data.get("title")
    final_amount = data.get("final_amount")
    investor_username = data.get("investor")

    if not title or not final_amount or not investor_username:
        return Response(
            {"error": "title, final_amount, investor required"},
            status=400
        )

    # Find investor
    try:
        investor = User.objects.get(username=investor_username)
    except User.DoesNotExist:
        return Response({"error": "Investor not found"}, status=404)

    amount = float(final_amount)

    # Create project (fill ALL required fields)
    project = Project.objects.create(
        title=title,
        creator=request.user,
        investor=investor,

        total_amount=amount,
        upfront_amount=amount * 0.3,   # 30% upfront (example)
        final_amount=amount,

        status="created"
    )

    return Response({
        "created": True,
        "project_id": project.id
    })
