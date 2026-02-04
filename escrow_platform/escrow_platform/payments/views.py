from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from projects.models import Project
from .models import Payment
from .services.finternet import FinternetAPI


# -----------------------------------
# Create Upfront (Authorize) Payment
# -----------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_upfront_payment(request, project_id):

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=404)

    # Only investor can pay
    if project.investor != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    # Prevent duplicate upfront payments
    payment, created = Payment.objects.get_or_create(
        project=project,
        payment_type="upfront",
        defaults={
            "amount": project.upfront_amount,   # ✅ FIXED
            "status": "authorized",
            "finternet_txn_id": "TXN_AUTH_123"   # Demo transaction ID
        }
    )

    return Response({
        "authorized": True,
        "created": created,
        "payment_id": payment.id
    })


# -----------------------------------
# Approve & Capture Final Payment
# -----------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve(request, project_id):

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=404)

    # Only investor can approve
    if project.investor != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    # Find authorized upfront payment
    payment = Payment.objects.filter(
        project=project,
        payment_type="upfront",
        status="authorized"
    ).first()

    if not payment:
        return Response(
            {"error": "No authorized upfront payment"},
            status=400
        )

    # Call Finternet (fake gateway)
    api = FinternetAPI()

    result = api.capture(
        payment.finternet_txn_id,
        project.final_amount
    )

    # Mark upfront as captured
    payment.status = "captured"
    payment.save()

    # Prevent duplicate final payment
    Payment.objects.get_or_create(
        project=project,
        payment_type="final",
        defaults={
            "amount": project.final_amount,
            "status": "paid",
            "finternet_txn_id": payment.finternet_txn_id
        }
    )

    # Update project status
    project.status = "completed"
    project.save()

    return Response({
        "done": True,
        "gateway_response": result
    })
