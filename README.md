# Cricket Shot Recognition using VideoMAE

An AI-powered video classification system that analyzes cricket batting
videos and predicts the type of cricket shot using a fine-tuned
VideoMAE-Small model.

## Overview

The system takes a cricket video as input, extracts 16 frames,
processes the temporal information using VideoMAE, and predicts the
most likely batting shot along with its confidence score and top-3
predictions.

## Model

- Architecture: VideoMAE-Small
- Input: Cricket video
- Frames per video: 16
- Number of classes: 10
- Device: CPU-compatible inference



## Cricket Shot Classes

- Cover
- Defense
- Flick
- Hook
- Late Cut
- Lofted
- Pull
- Square Cut
- Straight
- Sweep

## Tech Stack

- Python
- PyTorch
- Hugging Face Transformers
- VideoMAE
- OpenCV
- NumPy
- FastAPI
- HTML
- CSS
- JavaScript





## Workflow

Video Upload
     ↓
Frame Extraction
     ↓
16 Video Frames
     ↓
VideoMAE-Small
     ↓
Shot Classification
     ↓
Prediction + Confidence + Top-3 Results





## Application

The project includes a FastAPI backend that receives uploaded cricket
videos and returns the model prediction to the frontend.

The frontend provides:

- Video upload
- Video preview
- Evaluate Shot button
- Predicted shot
- Confidence score
- Top-3 predictions