from fastapi import APIRouter

router = APIRouter(tags=["policies"])


@router.get("/policies")
def policies() -> dict:
    return {
        "items": [
            {"name": "Require approval for production deploys", "status": "enforced", "owner": "platform-security"},
            {"name": "Namespaces must have labels and quotas", "status": "enforced", "owner": "platform"},
            {"name": "Audit all privileged actions", "status": "enforced", "owner": "security"},
            {"name": "Blue/green rollout preferred", "status": "recommended", "owner": "release-engineering"},
        ]
    }
