from pydantic import BaseModel

class GeminiPredictionRequest(BaseModel):
    text: str
    temperature: float = 1.0
    max_output_tokens: int = 100
