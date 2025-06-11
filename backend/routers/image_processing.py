from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import os
import subprocess
import shutil

router = APIRouter()

UPLOAD_DIRECTORY = "./uploads"
OUTPUT_DIRECTORY = "./backend/mistralai_nb"

# Ensure upload and output directories exist
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)

@router.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    output_filename = f"{os.path.splitext(file.filename)[0]}_extracted.txt"
    notebook_path = os.path.join(OUTPUT_DIRECTORY, "notebook.py")
    output_file_path = os.path.join(OUTPUT_DIRECTORY, output_filename)

    try:
        # Run notebook.py as a subprocess
        process = subprocess.run(
            ["python", notebook_path, file_location, output_filename],
            capture_output=True, text=True, check=True
        )
        print("notebook.py stdout:", process.stdout)
        print("notebook.py stderr:", process.stderr)
    except subprocess.CalledProcessError as e:
        print(f"Error running notebook.py: {e}")
        print(f"stdout: {e.stdout}")
        print(f"stderr: {e.stderr}")
        raise HTTPException(status_code=500, detail="Error processing image")

    if os.path.exists(output_file_path):
        # Read the content of the output file
        extracted_data = {}
        with open(output_file_path, 'r') as f:
            for line in f:
                if ':' in line:
                    key, value = line.split(':', 1)
                    extracted_data[key.strip()] = value.strip()
        
        # Clean up the uploaded image and output text file (optional but good practice)
        os.remove(file_location)
        os.remove(output_file_path)

        return JSONResponse(content=extracted_data)
    else:
        raise HTTPException(status_code=500, detail="Failed to generate output file") 