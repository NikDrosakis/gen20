from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import requests
import json
from typing import Any, Dict, List, Optional
from datetime import datetime

app = FastAPI()

class AI:
    def __init__(self, model_provider: str = "openai", cache_dir: str = "/var/cache/kronos"):
        self.model_provider = model_provider
        self.cache_dir = cache_dir
        self.api_keys = self.load_api_keys()
        self.cache_enabled = True
        self.history = []
        self._initialize_cache()

    def _initialize_cache(self):
        """ Initialize the cache directory if not already created. """
        if self.cache_enabled and not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

    def load_api_keys(self) -> Dict[str, str]:
        """ Load API keys for various model providers from environment variables or configuration file. """
        return {
            "openai": os.getenv("OPENAI_API_KEY", "your_openai_key"),
            "cohere": os.getenv("COHERE_API_KEY", "your_cohere_key"),
            "huggingface": os.getenv("HUGGINGFACE_API_KEY", "your_huggingface_key")
        }

    def get_model_provider(self) -> str:
        """ Return the current model provider being used. """
        return self.model_provider

    def set_model_provider(self, provider: str):
        """ Set a new model provider for API interactions. """
        if provider in self.api_keys:
            self.model_provider = provider
        else:
            raise ValueError(f"Model provider '{provider}' not recognized or API key not available.")

    def generate_text(self, prompt: str, max_tokens: int = 100, **kwargs) -> str:
        """ Generate text using the current model provider. """
        if self.model_provider == "openai":
            return self._openai_generate(prompt, max_tokens, **kwargs)
        elif self.model_provider == "cohere":
            return self._cohere_generate(prompt, max_tokens, **kwargs)
        elif self.model_provider == "huggingface":
            return self._huggingface_generate(prompt, max_tokens, **kwargs)
        else:
            raise ValueError(f"Unsupported model provider: {self.model_provider}")

    def _openai_generate(self, prompt: str, max_tokens: int, **kwargs) -> str:
        """ Generate text using OpenAI's API. """
        api_key = self.api_keys["openai"]
        url = "https://api.openai.com/v1/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": kwargs.get("model", "text-davinci-003"),
            "prompt": prompt,
            "max_tokens": max_tokens
        }
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            output = response.json().get("choices", [{}])[0].get("text", "")
            self._log_history("openai", prompt, output)
            return output
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

    def _cohere_generate(self, prompt: str, max_tokens: int, **kwargs) -> str:
        """ Generate text using Cohere's API. """
        api_key = self.api_keys["cohere"]
        url = "https://api.cohere.ai/generate"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": kwargs.get("model", "command-xlarge"),
            "prompt": prompt,
            "max_tokens": max_tokens
        }
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            output = response.json().get("generations", [{}])[0].get("text", "")
            self._log_history("cohere", prompt, output)
            return output
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

    def _huggingface_generate(self, prompt: str, max_tokens: int, **kwargs) -> str:
        """ Generate text using Hugging Face's API. """
        api_key = self.api_keys["huggingface"]
        url = f"https://api-inference.huggingface.co/models/{kwargs.get('model', 'gpt2')}"
        headers = {"Authorization": f"Bearer {api_key}"}
        data = {"inputs": prompt, "max_tokens": max_tokens}
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            output = response.json()[0].get("generated_text", "")
            self._log_history("huggingface", prompt, output)
            return output
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

    def _log_history(self, provider: str, prompt: str, output: str):
        """ Log the history of requests for auditing and debugging purposes. """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "provider": provider,
            "prompt": prompt,
            "output": output
        }
        self.history.append(log_entry)

    def get_history(self) -> List[Dict[str, Any]]:
        """ Return the request history for debugging or audit. """
        return self.history

    def clear_history(self):
        """ Clear the request history. """
        self.history.clear()

    def cache_response(self, prompt: str, output: str):
        """ Cache the generated response to avoid repeated API calls. """
        if self.cache_enabled:
            cache_file = os.path.join(self.cache_dir, f"{hash(prompt)}.json")
            with open(cache_file, 'w') as f:
                json.dump({"prompt": prompt, "output": output}, f)

    def get_cached_response(self, prompt: str) -> Optional[str]:
        """ Retrieve a cached response if it exists. """
        if self.cache_enabled:
            cache_file = os.path.join(self.cache_dir, f"{hash(prompt)}.json")
            if os.path.exists(cache_file):
                with open(cache_file, 'r') as f:
                    cached_data = json.load(f)
                    return cached_data.get("output")
        return None


# FastAPI Endpoints

class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 100
    provider: Optional[str] = None

ai = AI()

@app.post("/generate/")
async def generate_text(request: GenerateRequest):
    if request.provider:
        kronos.set_model_provider(request.provider)
    cached_response = kronos.get_cached_response(request.prompt)
    if cached_response:
        return {"output": cached_response, "cached": True}

    try:
        output = kronos.generate_text(request.prompt, request.max_tokens)
        kronos.cache_response(request.prompt, output)
        return {"output": output, "cached": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/")
async def get_history():
    return kronos.get_history()

@app.post("/clear_history/")
async def clear_history():
    kronos.clear_history()
    return {"status": "History cleared"}

@app.post("/set_provider/")
async def set_provider(provider: str):
    try:
        kronos.set_model_provider(provider)
        return {"status": f"Provider set to {provider}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/current_provider/")
async def get_current_provider():
    return {"current_provider": kronos.get_model_provider()}

@app.post("/enable_cache/")
async def enable_cache():
    kronos.cache_enabled = True
    return {"status": "Caching enabled"}

@app.post("/disable_cache/")
async def disable_cache():
    kronos.cache_enabled = False
    return {"status": "Caching disabled"}
