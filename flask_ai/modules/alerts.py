"""
AgriLink Price Alert Engine
----------------------------
Allows users to set a target price for a crop.
The engine checks current predicted prices against stored alerts
and returns any that have been triggered.

Storage: in-memory dict (upgradeable to MongoDB/Redis for production).
"""

import time
import uuid
from typing import Optional
from modules.model import predict_price
from datetime import datetime


# ── In-memory alert store ─────────────────────────────────────────────────────
# Structure: { alert_id → AlertRecord }
_alerts: dict = {}


class AlertRecord:
    def __init__(self, user_id: str, crop: str, target_price: float,
                 condition: str, location: str):
        self.id = str(uuid.uuid4())[:8]
        self.user_id = user_id
        self.crop = crop.lower()
        self.target_price = target_price
        self.condition = condition          # "above" | "below"
        self.location = location
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.status = "watching"            # "watching" | "triggered" | "dismissed"
        self.last_checked_price = None
        self.triggered_at = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "crop": self.crop.capitalize(),
            "target_price": self.target_price,
            "condition": self.condition,
            "location": self.location,
            "status": self.status,
            "created_at": self.created_at,
            "last_checked_price": self.last_checked_price,
            "triggered_at": self.triggered_at,
        }


def create_alert(user_id: str, crop: str, target_price: float,
                 condition: str = "above", location: str = "East Hararghe") -> dict:
    """
    Create a new price alert.
    
    Args:
        user_id: Unique user/session identifier
        crop: Crop name (maize, teff, wheat, etc.)
        target_price: Price threshold in ETB
        condition: "above" (notify when price exceeds target) or
                   "below" (notify when price drops below target)
        location: Ethiopian region for price context
    
    Returns:
        dict with alert details and status
    """
    crop_lower = crop.lower()
    from modules.model import BASE_PRICES
    if crop_lower not in BASE_PRICES:
        supported = ', '.join(BASE_PRICES.keys())
        return {"error": f"Unsupported crop '{crop}'. Supported: {supported}"}

    alert = AlertRecord(user_id, crop, target_price, condition, location)
    _alerts[alert.id] = alert

    return {
        "success": True,
        "alert": alert.to_dict(),
        "message": (
            f"✅ Alert set! You'll be notified when **{crop.capitalize()}** price "
            f"goes **{condition}** {target_price:,.0f} ETB in {location}."
        )
    }


def check_alerts(user_id: str) -> dict:
    """
    Check all active alerts for a user against current predicted prices.
    Returns any triggered alerts with current price data.
    """
    current_month = datetime.now().strftime("%B")
    user_alerts = [a for a in _alerts.values()
                   if a.user_id == user_id and a.status in ("watching", "triggered")]

    if not user_alerts:
        return {"alerts": [], "triggered_count": 0}

    results = []
    triggered_count = 0

    for alert in user_alerts:
        try:
            current_price, _ = predict_price(alert.crop, current_month, alert.location)
            alert.last_checked_price = current_price

            # Evaluate trigger condition
            was_triggered = (
                (alert.condition == "above" and current_price >= alert.target_price) or
                (alert.condition == "below" and current_price <= alert.target_price)
            )

            if was_triggered and alert.status == "watching":
                alert.status = "triggered"
                alert.triggered_at = datetime.now().strftime("%Y-%m-%d %H:%M")
                triggered_count += 1
            elif not was_triggered and alert.status == "triggered":
                # Revert to watching if condition no longer met
                alert.status = "watching"

            record = alert.to_dict()
            record["current_price"] = current_price
            record["gap_etb"] = round(alert.target_price - current_price, 0)
            results.append(record)

        except Exception as e:
            print(f"[Alert Check ERROR] {alert.id}: {str(e)}")
            continue

    return {
        "alerts": results,
        "triggered_count": triggered_count,
        "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }


def dismiss_alert(alert_id: str, user_id: str) -> dict:
    """Dismiss (deactivate) a specific alert."""
    alert = _alerts.get(alert_id)
    if not alert:
        return {"error": "Alert not found"}
    if alert.user_id != user_id:
        return {"error": "Unauthorized"}

    alert.status = "dismissed"
    return {"success": True, "message": f"Alert {alert_id} dismissed."}


def get_user_alerts(user_id: str) -> list:
    """Get all non-dismissed alerts for a user."""
    return [
        a.to_dict()
        for a in _alerts.values()
        if a.user_id == user_id and a.status != "dismissed"
    ]
