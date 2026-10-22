from PIL import Image, ImageDraw
import numpy as np
import cv2

# === Parameters ===
input_path = "img/sketch2.jpg"
output_path = "video/sketch2_a.mp4"
min_contour_area = 30
draw_speed = 100.0
fps = 30

# === Load and preprocess ===
image = Image.open(input_path).convert("L")
image_np = np.array(image)
edges = cv2.Canny(image_np, 50, 150)

contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_contour_area]
contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])

# === Init canvas and video ===
canvas = Image.new("RGB", image.size, "white")
draw = ImageDraw.Draw(canvas)
height, width = image.size[::-1]
video = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))

# === Draw cumulatively ===
for cnt in contours:
    contour_points = [tuple(pt[0]) for pt in cnt]

    # Optional resample (for performance)
    contour_points = [contour_points[i] for i in range(0, len(contour_points), max(1, len(contour_points)//500))]

    length = sum(np.linalg.norm(np.subtract(contour_points[i], contour_points[i-1])) for i in range(1, len(contour_points)))
    duration = min(60, max(1, int((length / draw_speed) * fps)))
    step = max(1, len(contour_points) // duration)

    for i in range(2, len(contour_points), step):
        draw.line(contour_points[:i+1], fill="black", width=1)
        frame_cv = cv2.cvtColor(np.array(canvas), cv2.COLOR_RGB2BGR)
        video.write(frame_cv)

# === Finalize ===
video.release()
print(f"🖋️ Τελικό sketch animation αποθηκεύτηκε: {output_path}")
