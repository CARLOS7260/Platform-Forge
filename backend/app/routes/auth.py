from fastapi import APIRouter, Header

router = APIRouter(tags=["auth"])


@router.get("/me")
def me(x_user: str | None = Header(default=None)) -> dict:
    user = x_user or "platform-operator"
    role = "admin" if user in {"platform-operator", "platform-admin"} else "developer"
    return {
        "user": user,
        "role": role,
        "permissions": ["read:projects", "read:environments", "create:deploys", "view:audit"],
    }
