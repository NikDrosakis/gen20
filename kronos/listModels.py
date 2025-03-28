from huggingface_hub import HfApi

api = HfApi()
models = api.list_models()

for model in models:
    print(model.modelId)
