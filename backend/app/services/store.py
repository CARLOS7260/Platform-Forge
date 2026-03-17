from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class PlatformSnapshot:
    queue: deque = field(default_factory=deque)
    metrics: dict = field(default_factory=lambda: {"api_requests": 0, "deploys_running": 0, "environments_ready": 0})
    logs: list = field(default_factory=list)

    def push_log(self, message: str) -> None:
        self.logs.insert(0, {"timestamp": datetime.now(timezone.utc).isoformat(), "message": message})
        self.logs[:] = self.logs[:50]


snapshot = PlatformSnapshot()
