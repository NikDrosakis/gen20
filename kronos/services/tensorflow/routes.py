from fastapi import FastAPI, HTTPException, Request
import tensorflow as tf
import numpy as np

app = FastAPI()

# Load your TensorFlow model
model = keras.Sequential([
    keras.layers.Dense(5, input_shape=(3,)),
    keras.layers.Softmax()])
model.save("model.keras")
loaded_model = keras.saving.load_model("model.keras")
x = np.random.random((10, 3))
assert np.allclose(model.predict(x), loaded_model.predict(x))

@app.post("/predict")
async def predict(request: Request):
    try:
        data = await request.json()
        input_data = np.array(data["input"]).reshape((1, -1))  # Adjust shape as needed
        prediction = model.predict(input_data)
        return {"prediction": prediction.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}