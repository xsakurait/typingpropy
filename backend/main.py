from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import boto3
import uuid
import os
import requests
from jose import jwt
from datetime import datetime
from mangum import Mangum

app = FastAPI()

# Auth Configuration
REGION = os.getenv("REGION", "ap-northeast-1")
USER_POOL_ID = os.getenv("USER_POOL_ID")
CLIENT_ID = os.getenv("CLIENT_ID")
JWKS_URL = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"

_jwks_cache = None

def get_jwks():
    global _jwks_cache
    if not _jwks_cache:
        try:
            res = requests.get(JWKS_URL)
            _jwks_cache = res.json()["keys"]
        except Exception as e:
            print(f"Failed to fetch JWKS: {e}")
            return []
    return _jwks_cache

def verify_jwt(token: str):
    keys = get_jwks()
    if not keys:
        print("ERROR: No JWKS keys found")
        raise HTTPException(status_code=500, detail="Internal Auth Error")
    
    try:
        # Get the kid from header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        print(f"DEBUG: Token kid: {kid}")
        
        # Find the matching key
        key = next((k for k in keys if k["kid"] == kid), None)
        if not key:
            print(f"ERROR: No matching key for kid {kid}")
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Verify the signature
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=CLIENT_ID,
            issuer=f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}"
        )
        print(f"DEBUG: Verified user: {payload.get('sub')}")
        return payload
    except Exception as e:
        print(f"ERROR: Token validation failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid session: {str(e)}")

async def get_current_user(authorization: Optional[str] = Header(None)):
    if os.getenv("ENV") == "local":
        print("DEBUG: Skipping auth for local environment")
        return {"sub": "local-dev", "email": "dev@example.com"}
    
    if not authorization or not authorization.startswith("Bearer "):
        print("DEBUG: Authorization header missing or invalid format")
        raise HTTPException(status_code=401, detail="Authorization required")
    
    token = authorization.split(" ")[1]
    return verify_jwt(token)

try:
    dynamodb = boto3.resource(
        "dynamodb", region_name=REGION
    )
    lessons_table = dynamodb.Table(os.getenv("LESSONS_TABLE", "Lessons"))
    results_table = dynamodb.Table(os.getenv("RESULTS_TABLE", "TypingResults"))
    lessons_table.table_status
    USE_DYNAMO = True
except Exception:
    print("DynamoDB not available. Using in-memory storage for local development.")
    USE_DYNAMO = False
    MOCK_LESSONS = [
        {
            "id": "1",
            "title": "Python Lambda",
            "content": "print('Hello Lambda')",
            "language": "python",
        },
        {
            "id": "2",
            "title": "FastAPI",
            "content": "app = FastAPI()",
            "language": "python",
        },
    ]
    MOCK_RESULTS = []


class Lesson(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    language: str


class Result(BaseModel):
    id: Optional[str] = None
    wpm: int
    playedAt: Optional[str] = None


@app.get("/api/lessons", response_model=List[Lesson])
def get_lessons(user=Depends(get_current_user)):
    if not USE_DYNAMO:
        return MOCK_LESSONS
    try:
        response = lessons_table.scan()
        items = response.get("Items", [])
        if not items:
            initial_lessons = [
                {
                    "id": "1",
                    "title": "Python Lambda",
                    "content": "print('Hello Lambda')",
                    "language": "python",
                },
                {
                    "id": "2",
                    "title": "FastAPI",
                    "content": "app = FastAPI()",
                    "language": "python",
                },
            ]
            for il in initial_lessons:
                lessons_table.put_item(Item=il)
            return initial_lessons
        return items
    except Exception as e:
        print(f"Error: {e}")
        return []


@app.post("/api/lessons", response_model=Lesson)
def create_lesson(lesson: Lesson, user=Depends(get_current_user)):
    lesson.id = str(uuid.uuid4())
    if not USE_DYNAMO:
        MOCK_LESSONS.append(lesson.dict())
        return lesson
    lessons_table.put_item(Item=lesson.dict())
    return lesson


@app.post("/api/results")
def save_result(result: Result, user=Depends(get_current_user)):
    result.id = str(uuid.uuid4())
    result.playedAt = datetime.now().isoformat()
    if not USE_DYNAMO:
        MOCK_RESULTS.append(result.dict())
        return {"status": "success"}
    results_table.put_item(Item=result.dict())
    return {"status": "success"}


@app.get("/me")
def get_me(user=Depends(get_current_user)):
    return {"user": user.get("email", "unknown"), "role": "developer"}


handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
