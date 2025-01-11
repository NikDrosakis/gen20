import google.generativeai as genai
GOOGLEAI_APIKEY="AIzaSyBzMZiTWZPLZuoPkPhCyeFGMa0DhCUcS3M"
genai.configure(api_key="AIzaSyBzMZiTWZPLZuoPkPhCyeFGMa0DhCUcS3M")
model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("Explain how AI works")
print(response.text)