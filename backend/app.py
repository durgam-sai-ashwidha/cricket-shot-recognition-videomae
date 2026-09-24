import os
import shutil
import uuid

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from predict import predict_video


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Cricket Shot Recognition API",
    description="VideoMAE-Small based cricket shot classification",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    # Allow frontend during local development
    allow_origins=["*"],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "status": "online",
        "message": "Cricket Shot Recognition API is running",
        "model": "VideoMAE-Small",
        "classes": 10
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "message": "FastAPI backend is working"
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # CHECK FILE
    # --------------------------------------------------------

    if not file:

        raise HTTPException(
            status_code=400,
            detail="No video file received."
        )


    # --------------------------------------------------------
    # CHECK FILE EXTENSION
    # --------------------------------------------------------

    filename_lower = file.filename.lower()

    allowed_extensions = (
        ".mp4",
        ".avi",
        ".mov",
        ".mkv",
        ".webm"
    )

    if not filename_lower.endswith(
        allowed_extensions
    ):

        raise HTTPException(
            status_code=400,
            detail="Please upload a valid video file."
        )


    # --------------------------------------------------------
    # UNIQUE TEMPORARY FILE
    # --------------------------------------------------------

    file_id = str(
        uuid.uuid4()
    )

    temp_filename = (
        f"{file_id}.mp4"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        temp_filename
    )


    try:

        # ----------------------------------------------------
        # SAVE VIDEO TEMPORARILY
        # ----------------------------------------------------

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        print()
        print("=" * 60)
        print("VIDEO RECEIVED")
        print("=" * 60)

        print(
            "Original filename:",
            file.filename
        )

        print(
            "Temporary file:",
            temp_filename
        )

        print(
            "Running VideoMAE prediction..."
        )

        print("=" * 60)


        # ----------------------------------------------------
        # RUN MODEL
        # ----------------------------------------------------

        result = predict_video(
            file_path
        )


        # ----------------------------------------------------
        # PRINT RESULT
        # ----------------------------------------------------

        print("=" * 60)
        print("PREDICTION COMPLETE")
        print("=" * 60)

        print(result)

        print("=" * 60)


        # ----------------------------------------------------
        # SEND RESULT TO FRONTEND
        # ----------------------------------------------------

        return {
            "success": True,
            "filename": file.filename,
            **result
        }


    except Exception as e:

        print()
        print("=" * 60)
        print("PREDICTION ERROR")
        print("=" * 60)

        print(str(e))

        print("=" * 60)


        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


    finally:

        # ----------------------------------------------------
        # DELETE TEMPORARY VIDEO
        # ----------------------------------------------------

        if os.path.exists(file_path):

            try:

                os.remove(file_path)

                print(
                    "Temporary video deleted:",
                    temp_filename
                )

            except Exception as e:

                print(
                    "Could not delete temporary file:",
                    e
                )