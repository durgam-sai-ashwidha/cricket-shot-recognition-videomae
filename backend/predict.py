
import os
import cv2
import torch
import numpy as np
import gdown

from transformers import (
    VideoMAEImageProcessor,
    VideoMAEForVideoClassification
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "model",
        "best_cricket_videomae.pt"
    )
)

MODEL_FILE_ID = "1XI66woZglsWmVfGwEHEFBPoycDv1N_TQ"

MODEL_NAME = "MCG-NJU/videomae-small-finetuned-kinetics"

NUM_FRAMES = 16

DEVICE = torch.device("cpu")


# ============================================================
# DOWNLOAD MODEL IF MISSING
# ============================================================

print()
print("=" * 60)
print("LOADING CRICKET SHOT MODEL")
print("=" * 60)

print("Model path:", MODEL_PATH)

if not os.path.exists(MODEL_PATH):
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    print("Downloading trained VideoMAE checkpoint from Google Drive...")

    downloaded_file = gdown.download(
        id=MODEL_FILE_ID,
        output=MODEL_PATH,
        quiet=False
    )

    if downloaded_file is None:
        raise RuntimeError(
            "Model download failed. Check the Google Drive sharing settings."
        )

if (
    not os.path.isfile(MODEL_PATH)
    or os.path.getsize(MODEL_PATH) == 0
):
    raise FileNotFoundError(
        f"Model checkpoint is missing or empty: {MODEL_PATH}"
    )

print("Checkpoint file is available.")


# ============================================================
# LOAD CHECKPOINT
# ============================================================

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

CLASS_NAMES = checkpoint["class_names"]
LABEL2ID = checkpoint["label2id"]
ID2LABEL = checkpoint["id2label"]

print("Checkpoint loaded successfully")
print("Classes:", CLASS_NAMES)
print("Number of frames:", checkpoint["num_frames"])
print("Best validation accuracy:", checkpoint["val_accuracy"])


# ============================================================
# LOAD PROCESSOR
# ============================================================

processor = VideoMAEImageProcessor.from_pretrained(
    MODEL_NAME
)


# ============================================================
# LOAD MODEL
# ============================================================

model = VideoMAEForVideoClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(CLASS_NAMES),
    label2id=LABEL2ID,
    id2label=ID2LABEL,
    ignore_mismatched_sizes=True
)


# ============================================================
# LOAD TRAINED WEIGHTS
# ============================================================

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.to(DEVICE)
model.eval()

print("VideoMAE model loaded successfully")
print("Device:", DEVICE)
print("=" * 60)


# ============================================================
# FRAME EXTRACTION
# ============================================================

def extract_frames(video_path):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError("Could not open uploaded video.")

    try:
        total_frames = int(
            cap.get(cv2.CAP_PROP_FRAME_COUNT)
        )

        if total_frames <= 0:
            raise ValueError("Video contains no readable frames.")

        frame_indices = np.linspace(
            0,
            total_frames - 1,
            NUM_FRAMES
        ).astype(int)

        frames = []

        for index in frame_indices:
            cap.set(
                cv2.CAP_PROP_POS_FRAMES,
                int(index)
            )

            success, frame = cap.read()

            if success:
                frame = cv2.cvtColor(
                    frame,
                    cv2.COLOR_BGR2RGB
                )
                frames.append(frame)

        if len(frames) == 0:
            raise ValueError("Could not extract frames.")

        while len(frames) < NUM_FRAMES:
            frames.append(frames[-1].copy())

        return frames

    finally:
        cap.release()


# ============================================================
# PREDICTION
# ============================================================

def predict_video(video_path):
    print("Extracting frames...")

    frames = extract_frames(video_path)

    print("Frames extracted:", len(frames))

    inputs = processor(
        frames,
        return_tensors="pt"
    )

    pixel_values = inputs["pixel_values"].to(DEVICE)

    with torch.no_grad():
        outputs = model(
            pixel_values=pixel_values
        )

        probabilities = torch.softmax(
            outputs.logits,
            dim=-1
        )[0]

    top_values, top_indices = torch.topk(
        probabilities,
        k=min(3, len(CLASS_NAMES))
    )

    top_predictions = []

    for value, index in zip(top_values, top_indices):
        class_index = index.item()

        top_predictions.append({
            "shot": CLASS_NAMES[class_index],
            "confidence": round(
                value.item() * 100,
                2
            )
        })

    best = top_predictions[0]

    return {
        "prediction": best["shot"],
        "confidence": best["confidence"],
        "top_predictions": top_predictions
    }
