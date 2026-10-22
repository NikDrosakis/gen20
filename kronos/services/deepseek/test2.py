from deepseek import DeepSeekClient
from config import setting
# Initialize client
client = DeepSeekClient(setting.DEEPSEEK_API_KEY)

# Regular completion
response = client.chat_completion(
    messages=[{"role": "user", "content": "Hello from Gen20 > Kronos. "}]
)
print(response.choices[0].message.content)

# Streaming response
for chunk in client.stream_response(
    messages=[{"role": "user", "content": "Hello from Gen20 > Kronos"}]
):
    print(chunk.choices[0].delta.content or "", end="")

# Async usage
import asyncio

async def main():
    response = await client.async_chat_completion(
        messages=[{"role": "user", "content": "Hello from Gen20 > Kronos"}]
    )
    print(response.choices[0].message.content)

asyncio.run(main())