from fastapi import APIRouter

from app.services.store import snapshot

router = APIRouter(tags=["timeline"])


@router.get("/timeline")
def timeline() -> dict:
    items = []
    for entry in snapshot.logs[:10]:
        items.append({
            "time": entry["timestamp"],
            "title": entry["message"],
            "type": "event",
        })
    if not items:
        items = [
            {"time": "now", "title": "Platform ready", "type": "state"},
        ]
    return {"items": items}
