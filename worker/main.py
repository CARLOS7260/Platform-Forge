import os
import json
import time
from datetime import datetime, timezone

import redis
import httpx

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
api_base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
internal_token = os.getenv("INTERNAL_TOKEN", "dev-internal-token")
queue = redis.from_url(redis_url, decode_responses=True)
jobs_key = os.getenv("JOBS_KEY", "platformforge:jobs")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def process_job(job: dict) -> None:
    job_type = job.get("type")
    if job_type == "provision_env":
        env_id = int(job["environment_id"])
        print(f"[{now()}] job provision_env env={env_id}")
        time.sleep(1.5)
        with httpx.Client(timeout=10.0) as client:
            client.post(
                f"{api_base_url}/internal/environments/{env_id}/ready",
                headers={"X-Internal-Token": internal_token},
            ).raise_for_status()
        return

    if job_type == "finalize_deploy":
        deploy_id = int(job["deploy_id"])
        print(f"[{now()}] job finalize_deploy deploy={deploy_id}")
        time.sleep(2.0)
        with httpx.Client(timeout=10.0) as client:
            client.post(
                f"{api_base_url}/internal/deploys/{deploy_id}/succeed",
                headers={"X-Internal-Token": internal_token},
            ).raise_for_status()
        return

    print(f"[{now()}] unknown job {job}")


def run() -> None:
    print(f"[{now()}] worker started")
    while True:
        try:
            item = queue.blpop(jobs_key, timeout=5)
            if not item:
                continue
            _, payload = item
            job = json.loads(payload)
            process_job(job)
        except Exception:
            print(f"[{now()}] worker loop error")
        time.sleep(5)


if __name__ == "__main__":
    run()
