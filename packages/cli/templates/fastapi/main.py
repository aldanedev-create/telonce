"""
FastAPI + Teloce Example Application
"""

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse

app = FastAPI(title="Teloce + FastAPI")

# Templates directory
templates = Jinja2Templates(directory="templates")


@app.get("/")
async def home(request: Request):
    """Home page with Teloce integration"""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "name": "FastAPI Developer",
            "title": "Teloce + FastAPI"
        }
    )


@app.get("/api/data")
async def get_data():
    """Example API endpoint for Teloce to fetch data"""
    return JSONResponse({
        "message": "Hello from FastAPI!",
        "items": ["FastAPI", "Teloce", "Python", "Reactive", "Modern"],
        "count": 5
    })


@app.get("/api/todos")
async def get_todos():
    """Get todos from API"""
    return JSONResponse([
        {"id": 1, "text": "Learn FastAPI", "done": True},
        {"id": 2, "text": "Build with Teloce", "done": False},
        {"id": 3, "text": "Deploy to production", "done": False}
    ])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)