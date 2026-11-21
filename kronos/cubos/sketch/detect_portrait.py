import cv2
import time

camera = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

STABILITY_TIME = 2  # seconds
face_detected_time = 0

while True:
    ret, frame = camera.read()
    if not ret:
        continue

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) > 0:
        if face_detected_time == 0:
            face_detected_time = time.time()
        elif time.time() - face_detected_time >= STABILITY_TIME:
            cv2.imwrite("portrait.jpg", frame)
            print("📸 Stable portrait captured.")
            break
    else:
        face_detected_time = 0
