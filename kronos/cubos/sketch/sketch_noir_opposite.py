from PIL import Image, ImageDraw
import numpy as np
import cv2
import os

# === Parameters ===
input_folder = "img"
output_folder = "video"
min_contour_area = 30
draw_speed = 100.0
fps = 30

os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
        continue

    input_path = os.path.join(input_folder, filename)
    output_filename = os.path.splitext(filename)[0] + "_c.mp4"  # "_c" for collapse
    output_path = os.path.join(output_folder, output_filename)

    image = Image.open(input_path).convert("L")
    image_np = np.array(image)
    edges = cv2.Canny(image_np, 50, 150)

    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_contour_area]
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])

    # === Start from complete sketch ===
    canvas = Image.new("RGB", image.size, "black")
    draw = ImageDraw.Draw(canvas)
    height, width = image.size[::-1]
    video = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))

    # Pre-draw entire sketch
    all_contours = []
    for cnt in contours:
        contour_points = [tuple(pt[0]) for pt in cnt]
        contour_points = [contour_points[i] for i in range(0, len(contour_points), max(1, len(contour_points)//500))]
        draw.line(contour_points, fill="white", width=1)
        all_contours.append(contour_points)

    # Save full sketch as first frame
    video.write(cv2.cvtColor(np.array(canvas), cv2.COLOR_RGB2BGR))

    # Reverse erase contours one by one
    for contour_points in reversed(all_contours):
        length = sum(np.linalg.norm(np.subtract(contour_points[i], contour_points[i-1])) for i in range(1, len(contour_points)))
        duration = min(60, max(1, int((length / draw_speed) * fps)))
        step = max(1, len(contour_points) // duration)

        for i in range(len(contour_points), 2, -step):
            temp_canvas = canvas.copy()
            temp_draw = ImageDraw.Draw(temp_canvas)
            temp_draw.line(contour_points[:i], fill="black", width=1)  # ← erase with black
            frame_cv = cv2.cvtColor(np.array(temp_canvas), cv2.COLOR_RGB2BGR)
            video.write(frame_cv)

        # Full erase of contour (final clean)
        draw.line(contour_points, fill="black", width=1)

    # Optional: add a few seconds of pure black silence
    for _ in range(fps * 2):
        black_frame = np.zeros((height, width, 3), dtype=np.uint8)
        video.write(black_frame)

    video.release()
    print(f"🖋️ Noir erasure sketch saved: {output_path}")
