import requests
from django.conf import settings


class FinternetAPI:
    """
    Finternet / Ternet payment service
    """

    BASE = "https://api.ternet.com/v1"

    def headers(self):
        return {
            "Authorization": f"Bearer {settings.TERNET_API_KEY}",
            "Content-Type": "application/json"
        }

    def authorize(self, amount, user_id=None):
        """
        Authorize payment (real or demo)
        """

        # If no real API key → mock response
        if not hasattr(settings, "TERNET_API_KEY"):
            return {
                "transaction_id": "TXN_AUTH_123",
                "status": "authorized"
            }

        return requests.post(
            f"{self.BASE}/authorize",
            headers=self.headers(),
            json={
                "amount": float(amount),
                "user_id": user_id
            }
        ).json()

    def capture(self, txn_id, amount):
        """
        Capture payment
        """

        # If no real API key → mock response
        if not hasattr(settings, "TERNET_API_KEY"):
            return {
                "transaction_id": txn_id,
                "status": "captured",
                "amount": amount
            }

        return requests.post(
            f"{self.BASE}/capture",
            headers=self.headers(),
            json={
                "transaction_id": txn_id,
                "amount": float(amount)
            }
        ).json()
