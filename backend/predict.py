import os
import cv2
import torch
import numpy as np

from transformers import (
    VideoMAEImageProcessor,
    VideoMAEForVideoClassification
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "model",
        "best_cricket_videomae.pt"
    )
)

MODEL_NAME = (
    "MCG-NJU/videomae-small-finetuned-kinetics"
)

NUM_FRAMES = 16

DEVICE = torch.device("cpu")


# ============================================================
# CHECK MODEL
# ============================================================

print()
print("=" * 60)
print("LOADING CRICKET SHOT MODEL")
print("=" * 60)

print(
    "Model path:",
    MODEL_PATH
)

if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"Model file not found:\n{MODEL_PATH}"
    )


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


print(
    "Checkpoint loaded successfully"
)

print(
    "Classes:",
    CLASS_NAMES
)

print(
    "Number of frames:",
    checkpoint["num_frames"]
)

print(
    "Best validation accuracy:",
    checkpoint["val_accuracy"]
)


# ============================================================
# LOAD PROCESSOR
# ============================================================

processor = (
    VideoMAEImageProcessor.from_pretrained(
        MODEL_NAME
    )
)


# ============================================================
# LOAD MODEL
# ============================================================

model = (
    VideoMAEForVideoClassification
    .from_pretrained(
        MODEL_NAME,
        num_labels=len(CLASS_NAMES),
        label2id=LABEL2ID,
        id2label=ID2LABEL,
        ignore_mismatched_sizes=True
    )
)


# ============================================================
# LOAD TRAINED WEIGHTS
# ============================================================

model.load_state_dict(
    checkpoint["model_state_dict"]
)


model.to(DEVICE)

model.eval()


print(
    "VideoMAE model loaded successfully"
)

print(
    "Device:",
    DEVICE
)

print("=" * 60)


# ============================================================
# FRAME EXTRACTION
# ============================================================

def extract_frames(video_path):

    cap = cv2.VideoCapture(
        video_path
    )


    if not cap.isOpened():

        raise ValueError(
            "Could not open uploaded video."
        )


    total_frames = int(
        cap.get(
            cv2.CAP_PROP_FRAME_COUNT
        )
    )


    if total_frames <= 0:

        cap.release()

        raise ValueError(
            "Video contains no readable frames."
        )


    # Select 16 frames uniformly
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

            frames.append(
                frame
            )


    cap.release()


    if len(frames) == 0:

        raise ValueError(
            "Could not extract frames."
        )


    # Make sure exactly 16 frames exist
    while len(frames) < NUM_FRAMES:

        frames.append(
            frames[-1].copy()
        )


    return frames


# ============================================================
# PREDICTION
# ============================================================

def predict_video(video_path):

    print(
        "Extracting frames..."
    )


    frames = extract_frames(
        video_path
    )


    print(
        "Frames extracted:",
        len(frames)
    )


    # --------------------------------------------------------
    # PROCESS VIDEO
    # --------------------------------------------------------

    inputs = processor(
        frames,
        return_tensors="pt"
    )


    pixel_values = (
        inputs["pixel_values"]
        .to(DEVICE)
    )


    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    with torch.no_grad():

        outputs = model(
            pixel_values=pixel_values
        )


        probabilities = torch.softmax(
            outputs.logits,
            dim=-1
        )[0]


    # --------------------------------------------------------
    # TOP 3
    # --------------------------------------------------------

    top_values, top_indices = torch.topk(
        probabilities,
        k=3
    )


    top_predictions = []


    for value, index in zip(
        top_values,
        top_indices
    ):

        class_index = index.item()


        top_predictions.append({

            "shot":
                CLASS_NAMES[class_index],

            "confidence":
                round(
                    value.item() * 100,
                    2
                )

        })


    # --------------------------------------------------------
    # BEST RESULT
    # --------------------------------------------------------

    best = top_predictions[0]


    return {

        "prediction":
            best["shot"],

        "confidence":
            best["confidence"],

        "top_predictions":
            top_predictions

    }