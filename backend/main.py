from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import boto3
import uuid
import os
from datetime import datetime
from mangum import Mangum

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DynamoDB Setup
try:
    dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'ap-northeast-1'))
    lessons_table = dynamodb.Table(os.getenv('LESSONS_TABLE', 'Lessons'))
    results_table = dynamodb.Table(os.getenv('RESULTS_TABLE', 'TypingResults'))
    # Test connection
    lessons_table.table_status
    USE_DYNAMO = True
except Exception:
    print("DynamoDB not available. Using in-memory storage for local development.")
    USE_DYNAMO = False
    MOCK_LESSONS = [
        {"id": "1", "title": "Python Lambda", "content": "print('Hello Lambda')", "language": "python"},
        {"id": "2", "title": "FastAPI", "content": "app = FastAPI()", "language": "python"}
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
def get_lessons():
    if not USE_DYNAMO:
        return MOCK_LESSONS
    try:
        response = lessons_table.scan()
        items = response.get('Items', [])
        if not items:
            # Seed initial data
            initial_lessons = [
                {"id": "1", "title": "Python Lambda", "content": "print('Hello Lambda')", "language": "python"},
                {"id": "2", "title": "FastAPI", "content": "app = FastAPI()", "language": "python"}
            ]
            for il in initial_lessons:
                lessons_table.put_item(Item=il)
            return initial_lessons
        return items
    except Exception as e:
        print(f"Error: {e}")
        return []

@app.post("/api/lessons", response_model=Lesson)
def create_lesson(lesson: Lesson):
    lesson.id = str(uuid.uuid4())
    if not USE_DYNAMO:
        MOCK_LESSONS.append(lesson.dict())
        return lesson
    lessons_table.put_item(Item=lesson.dict())
    return lesson

@app.post("/api/results")
def save_result(result: Result):
    result.id = str(uuid.uuid4())
    result.playedAt = datetime.now().isoformat()
    if not USE_DYNAMO:
        MOCK_RESULTS.append(result.dict())
        return {"status": "success"}
    results_table.put_item(Item=result.dict())
    return {"status": "success"}

@app.get("/me")
def get_me():
    return {"user": "antigravity", "role": "developer"}

# Lambda handler
handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

