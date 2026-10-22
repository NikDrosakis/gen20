from PIL import Image, ImageDraw
import numpy as np
import cv2
import os
import mimetypes
import pwd
import grp
import ffmpeg  # requires: pip install ffmpeg-python

# === Parameters ===
input_folder = "/var/www/gs/media/vivalibro.com/sketch_img"
output_folder = "/var/www/gs/media/vivalibro.com/sketch_video"

min_contour_area = 30
draw_speed = 100.0
fps = 30

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# === MIME type verification ===
mimetypes.init()
mime_type, _ = mimetypes.guess_type("example.mp4")
if mime_type != "video/mp4":
    print("⚠️ MIME type mismatch:", mime_type)
else:
    print("✅ MIME type confirmed: video/mp4")

# === Process each image ===
for filename in os.listdir(input_folder):
    if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
        continue

    input_path = os.path.join(input_folder, filename)
    base_filename = os.path.splitext(filename)[0]
    temp_output = os.path.join(output_folder, base_filename + "_.mp4")
    final_output = os.path.join(output_folder, base_filename + "-noir.mp4")

    image = Image.open(input_path).convert("L")
    image_np = np.array(image)

    edges = cv2.Canny(image_np, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_contour_area]
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])

    canvas = Image.new("RGB", image.size, "black")
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
            draw.line(points[:i+1], fill="white", width=1)
            frame_cv = cv2.cvtColor(np.array(canvas), cv2.COLOR_RGB2BGR)
            video.write(frame_cv)

    video.release()

    # === Re-encode with ffmpeg-python ===
    try:
        ffmpeg.input(temp_output).output(
            final_output,
            vcodec='libx264',
            acodec='aac',
            strict='experimental',
            preset='fast',
            crf=23
        ).overwrite_output().run()
        print(f"🎞️ Re-encoded: {final_output}")
    except ffmpeg.Error as e:
        print("❌ FFmpeg re-encoding error:", e.stderr.decode())

    # === Set ownership and permissions ===
    try:
        uid = pwd.getpwnam("dros").pw_uid
        gid = grp.getgrnam("dros").gr_gid
        os.chown(final_output, uid, gid)
    except KeyError:
        print("⚠️ User or group 'dros' not found. Skipping ownership change.")

    os.chmod(final_output, 0o775)

    print(f"✅ Permissions and ownership set.")
    print(f"🖋️ Final sketch animation saved: {final_output}")
   # === Delete temporary file ===
    if os.path.exists(temp_output):
        try:
            os.remove(temp_output)
            print(f"🧹 Temp file deleted: {temp_output}")
        except Exception as e:
            print(f"⚠️ Could not delete temp file {temp_output}: {e}")