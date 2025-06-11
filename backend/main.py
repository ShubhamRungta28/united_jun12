# main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import auth
from backend.routers import user
from backend.routers import image_processing

app = FastAPI(debug=True)

origins = [
    "http://localhost:5174",
    "http://127.0.0.1:5174", # Explicitly add 127.0.0.1 for frontend
    "http://localhost:3000", # Add frontend development server origin
    # Add more origins here if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Explicitly list methods
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(auth.router, prefix="/auth")
app.include_router(image_processing.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 