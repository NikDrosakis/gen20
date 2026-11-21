from PIL import Image, ImageDraw
import numpy as np
import cv2
import os
import mimetypes
import pwd
import grp
import ffmpeg  # requires: pip install ffmpeg-python
from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import FileResponse
import shutil
import os
input_folder = "/var/www/gs/media/gen20.net/sketch_img"
output_folder = "/var/www/gs/media/gen20.net/sketch_video"
# Ensure folders exist
os.makedirs(input_folder, exist_ok=True)
os.makedirs(output_folder, exist_ok=True)
min_contour_area = 30
draw_speed = 100.0
fps = 30

def sketch_image_to_video(input_path, output_folder, pen_color="black", bg_color="white"):
    base_filename = os.path.splitext(os.path.basename(input_path))[0]
    temp_output = os.path.join(output_folder, base_filename + "_.mp4")
    final_output = os.path.join(output_folder, base_filename + ".mp4")

    image = Image.open(input_path).convert("L")
    image_np = np.array(image)

    edges = cv2.Canny(image_np, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_contour_area]
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])

    canvas = Image.new("RGB", image.size, bg_color)
    draw = ImageDraw.Draw(canvas)
    height, width = image.size[::-1]

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video = cv2.VideoWriter(temp_output, fourcc, fps, (width, height))

    for cnt in contours:
        points = [tuple(pt[0]) for pt in cnt]
        points = points[::max(1, len(points) // 500)]
        length = sum(np.linalg.norm(np.subtract(points[i], points[i-1])) for i in range(1, len(points)))
        duration = min(60, max(1, int((length / draw_speed) * fps)))
        step = max(1, len(points) // duration)

        for i in range(2, len(points), step):
            draw.line(points[:i+1], fill=pen_color, width=1)
            frame_cv = cv2.cvtColor(np.array(canvas), cv2.COLOR_RGB2BGR)
            video.write(frame_cv)

    video.release()

    ffmpeg.input(temp_output).output(
        final_output,
        vcodec='libx264',
        acodec='aac',
        strict='experimental',
        preset='fast',
        crf=23
    ).overwrite_output().run()

    return final_output, temp_output


router = APIRouter()

@router.get("/test")
def test_endpoint():
    return {"status": "OK", "message": "Sketch API is running."}

@router.post("/image")
async def sketch_endpoint(
    file: UploadFile,
    pen_color: str = Form("black"),
    bg_color: str = Form("white")
):
    upload_path = os.path.join(input_folder, file.filename)
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    final_output, temp_output = sketch_image_to_video(upload_path, output_folder, pen_color, bg_color)

    if os.path.exists(temp_output):
        os.remove(temp_output)

    return FileResponse(final_output, media_type="video/mp4", filename=os.path.basename(final_output))

