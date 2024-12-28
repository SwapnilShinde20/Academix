import cv2
import csv
import numpy as np
import time
from insightface.app import FaceAnalysis
from pathlib import Path
import requests
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
import threading
from datetime import datetime
from dotenv import load_dotenv
from flask_cors import CORS
from io import BytesIO
from PIL import Image
from flask import Flask, request, jsonify
from pymongo import MongoClient
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

flask = Flask(__name__)
CORS(flask,supports_credentials=True, origins=["http://localhost:5173","http://localhost:8000","https://major-project-y6c7.onrender.com","https://academix-ruby.vercel.app"])

app = FaceAnalysis(providers=['CUDAExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))  

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

client = MongoClient(os.getenv('MONGODB_URI'))
db = client.acadamix 

output_path= Path("./photos")
current_date = datetime.now().strftime("%Y-%m-%d")

@flask.route('/reg-encode', methods=['POST'])
def regEncoding():
    # Extract Cloudinary image URLs from the request
    cloud_image_links = request.json.get('img', [])
    print("cloud_image_links:", cloud_image_links)

    if not cloud_image_links:
        return jsonify({"error": "No image links provided"}), 400

    # Prepare lists to store results
    downloaded_images = []
    errors = []

    # Download images and store in a list
    for img_url in cloud_image_links:
        try:
            response = requests.get(img_url)
            if response.status_code == 200:
                # Convert the downloaded image to a format usable by OpenCV
                image = np.array(Image.open(BytesIO(response.content)))
                downloaded_images.append((img_url, image))
            else:
                errors.append({"image_url": img_url, "error": "Failed to fetch image"})
        except Exception as e:
            errors.append({"image_url": img_url, "error": str(e)})

    if not downloaded_images:
        return jsonify({
            "errors": errors,
            "encodings": []
        }), 400

    # Compute the average encoding for the downloaded images
    average_encoding = compute_average_encoding_from_images([img[1] for img in downloaded_images])

    # Check if a valid average encoding was computed
    if average_encoding is None:
        return jsonify({
            "errors": errors + [{"error": "No valid face embeddings found in the images."}],
            "encodings": []
        }), 400

    # Return the structured response with the average encoding
    return jsonify({
        "errors": errors,
        "encodings": average_encoding.tolist()
    }), 200

def compute_average_encoding_from_images(images):
    """
    Computes the average face encoding from a list of OpenCV image arrays.
    """
    embeddings = []
    for image in images:
        # Analyze the image and extract faces
        faces = app.get(image)  # Replace with your face detection model/method
        if not faces:
            print("No faces detected in one of the images")
            continue

        # Use the embedding of the first detected face
        embeddings.append(faces[0].embedding)

    # Compute the average embedding if there are any valid embeddings
    if embeddings:
        return np.mean(embeddings, axis=0)
    else:
        return None

@flask.route('/face_recognition',methods=['POST'])

def recognize_faces_in_photos():
    current_date = datetime.now().strftime("%Y-%m-%d")
    csv_file = output_path / f"recognized_{current_date}.csv"
    Code = request.form.get('classCode')
    
    recognized_students = set()
    lock = threading.Lock()  # Lock to ensure thread-safe updates to the set

    students = db.students.find({"classCode": Code})
    known_encodings = {}

    for student in students:
        if 'encoding' in student and student['encoding']:
            encoding = student['encoding'][0]
            if isinstance(encoding, (list, np.ndarray)) and 'username' in student:
                known_encodings[student['username']] = np.array(encoding)

    if 'image' not in request.files:
        return jsonify({"error": "No files found in request"}), 400

    group_photos = request.files.getlist('image')
    if not group_photos:
        return jsonify({"error": "No photos in the files array"}), 400

    def process_photo(photo_file):
        try:
            start_time = time.time()
            file_content = photo_file.read()
            np_arr = np.frombuffer(file_content, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if image is None:
                print(f"Error reading image: {photo_file.filename}")
                return

            faces = app.get(image)
            if not faces:
                print(f"No faces detected in {photo_file.filename}")
                return

            for face in faces:
                group_embedding = face.embedding
                matched = False

                for person_name, known_embedding in known_encodings.items():
                    similarity = np.dot(known_embedding, group_embedding) / (
                        np.linalg.norm(known_embedding) * np.linalg.norm(group_embedding)
                    )
                    if similarity > 0.6:
                        with lock:
                            recognized_students.add(person_name)
                        print(f"Face matched! {person_name} recognized in {photo_file.filename} with similarity {similarity:.2f}")  # New message
                        matched = True
                        break

                if not matched:
                    print("Face detected but no match found.")

            print(f"Time taken for {photo_file.filename}: {time.time() - start_time:.2f} seconds")

        except Exception as e:
            print(f"Error processing {photo_file.filename}: {e}")

    # Use ThreadPoolExecutor to process photos concurrently
    with ThreadPoolExecutor(max_workers=4) as executor:
        executor.map(process_photo, group_photos)

    # Write results to CSV
    with csv_file.open('w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Date", "Name", "Timestamp"])
        timestamp = datetime.now().strftime("%H:%M:%S")
        for student in sorted(recognized_students):
            writer.writerow([current_date, student, timestamp])

    upload_result = cloudinary.uploader.upload(
        str(csv_file),
        resource_type="raw",
        public_id=current_date
    )
    os.unlink(csv_file)

    filename = os.path.splitext(os.path.basename(csv_file))[0]
    attendance_record = {
        "filename": filename,
        "attachment": upload_result["secure_url"],
        "createdAt": datetime.now()
    }

    db.classrooms.update_one(
        {"classCode": Code}, {"$push": {"attendance": attendance_record}}
    )

    response = {
        "status": "success",
        "message": "File uploaded and attendance record added successfully."
    }

    return jsonify(response)

if __name__ == "__main__":
    flask.run(debug=True,port=5001)
