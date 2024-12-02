from google.cloud import aiplatform

def predict_text_gemini(text: str, project_id: str, model_id: str, location: str = "us-central1"):
    aiplatform.init(project=project_id, location=location)

    endpoint = aiplatform.Endpoint(
        endpoint_name=f"projects/{project_id}/locations/{location}/endpoints/{model_id}"
    )

    response = endpoint.predict(instances=[{"content": text}])
    prediction = response.predictions[0].text  # Extract the predicted text
    return prediction