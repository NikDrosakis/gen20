from transformers import GPTNeoForCausalLM, GPT2Tokenizer
import torch

try:
    # Load the GPT-Neo model and tokenizer
    model_name = "EleutherAI/gpt-neo-2.7B"
    tokenizer = GPT2Tokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    model = GPTNeoForCausalLM.from_pretrained(model_name)

    if torch.cuda.is_available():
        model = model.to("cuda")  # Move model to GPU if available
        print("GPU available, model moved to GPU")
    else:
        print("GPU not available, model running on CPU")
    # Define the prompt for the bio generation
    name = "Jane Smith"
    style = "formal and professional"
    theme = "exploring the complexities of human relationships"
    prompt = f"Generate a {style} professional bio for a writer named {name}. Include details about their writing style, notable works, themes, and career highlights, focusing on the theme of {theme}."


    # Tokenize input prompt
    inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True)

    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k, v in inputs.items()}  # Move input tensors to GPU

    # Generate output
    outputs = model.generate(
        inputs['input_ids'],
        attention_mask=inputs['attention_mask'],
        max_length=300,  # Increased max length
        num_return_sequences=1,
        num_beams=7,  # Increased beam size
        temperature=0.8,  # Adjusted temperature
        do_sample=True,
        top_k=40, # Reduced top_k
        top_p=0.8, # Reduced top_p
        no_repeat_ngram_size=3,
        pad_token_id=tokenizer.pad_token_id,
        repetition_penalty=1.2  # Added repetition penalty
    )

    # Decode and clean up the output
    bio = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

    print(bio)
except Exception as e:
    print(f"An error occurred: {e}")