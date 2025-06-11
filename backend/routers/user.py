from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
# import imghdr # Removed imghdr
import os
from PIL import Image # Import Pillow

from backend.auth.auth_handler import get_current_active_user
from backend.schemas import UserResponse
from backend.models import User

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}

def is_valid_image(file_path):
    try:
        # Attempt to open the image with Pillow
        img = Image.open(file_path)
        img.verify() # Verify if it's an image
        # Check if the format is one of the allowed types
        if img.format.lower() in ["jpeg", "png"]:
            return True
        else:
            return False
    except (IOError, SyntaxError) as e:
        # File is not an image or is corrupted
        print(f"Image validation failed: {e}")
        return False
    except Exception as e:
        # Catch any other unexpected errors during validation
        print(f"An unexpected error occurred during image validation: {e}")
        return False

@router.get("/users/me/", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_active_user)):
    # Ensure the 'uploads' directory exists
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)

    # Step 1: Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file extension. Only .jpg, .jpeg, .png are allowed.")

    # Step 2: Check MIME type (provided by the client)
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file MIME type. Only image/jpeg and image/png are allowed.")

    # Save temporarily to disk for magic byte validation
    temp_path = os.path.join(uploads_dir, f"temp_{file.filename}")
    try:
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Step 3: Check actual file content (magic bytes) using Pillow
        if not is_valid_image(temp_path):
            os.remove(temp_path) # Delete suspicious file
            raise HTTPException(status_code=400, detail="File is not a valid image. Content check failed.")

        # All checks pass, move to permanent storage
        final_path = os.path.join(uploads_dir, file.filename)
        # Handle potential filename conflicts (e.g., if a file with the same name already exists)
        if os.path.exists(final_path):
            name, _ = os.path.splitext(file.filename)
            final_path = os.path.join(uploads_dir, f"{name}_copy{ext}") # Simple conflict resolution
        
        os.rename(temp_path, final_path)

    except Exception as e:
        # Clean up temporary file if an error occurs during processing
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"File upload failed: {e}")

    return JSONResponse(content={
        "message": "Image uploaded successfully.",
        "filename": file.filename,
        "path": final_path
    }) 