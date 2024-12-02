import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyBzMZiTWZPLZuoPkPhCyeFGMa0DhCUcS3M")
model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("what is your name?.")
print(response.text)
