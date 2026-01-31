from flask import Flask, request, jsonify
import torch
import clip
import numpy as np
from PIL import Image
import base64
from io import BytesIO
import requests

app = Flask(__name__)

device = "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

def image_from_base64(b64):
    data = b64.split(",")[1]
    img_bytes = base64.b64decode(data)
    return Image.open(BytesIO(img_bytes)).convert("RGB")

def get_embedding(image):
    img = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        emb = model.encode_image(img)
        emb /= emb.norm(dim=-1, keepdim=True)
    return emb.cpu().numpy()[0]

@app.route("/match", methods=["POST"])
def match():
    uploaded_b64 = request.json["image"]
    items = request.json["items"]

    uploaded_img = image_from_base64(uploaded_b64)
    uploaded_emb = get_embedding(uploaded_img)

    best_score = -1
    best_id = None

    for item in items:
        img_url = item["imageUrl"]
        if not img_url:
            continue

        img = Image.open(BytesIO(requests.get(img_url).content)).convert("RGB")
        emb = get_embedding(img)

        score = np.dot(uploaded_emb, emb)

        if score > best_score:
            best_score = score
            best_id = item["_id"]

    if best_score < 0.75:
        return jsonify({ "matchId": None })

    return jsonify({
        "matchId": best_id,
        "confidence": float(best_score)
    })

if __name__ == "__main__":
    app.run(port=5001)
