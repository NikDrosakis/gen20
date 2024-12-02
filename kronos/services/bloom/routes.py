from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from transformers import AutoModelForCausalLM, AutoTokenizer

router = APIRouter()

# Load the Bloomz-7b1-mt model and tokenizer
model_name = "bigscience/bloomz-7b1-mt"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

@router.post("/chat")
async def chat_with_bloom(request: Request):
    try:
        request_data = await request.json()
        message = request_data.get("message")
        if not message:
            raise HTTPException(status_code=400, detail="Missing 'message' field in request body")

        # Encode the input message
        inputs = tokenizer(message, return_tensors="pt", padding=True, truncation=True)
        input_ids = inputs["input_ids"]
        attention_mask = inputs.get("attention_mask", None)  # Use get to handle optional keys

        # Generate a response
        response = model.generate(
            input_ids,
            attention_mask=attention_mask,
            max_length=1000,  # Adjust max_length as needed
            do_sample=True,  # Or False if you don't want sampling
            temperature=0.7,  # Only needed if sampling is enabled
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

        # Decode the response with clean-up
        response_text = tokenizer.decode(response[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)

        return JSONResponse(content={"response": response_text})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interacting with Bloomz-7b1-mt: {e}")
