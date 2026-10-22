from openai import OpenAI

client = OpenAI(api_key="sk-6f9b9c7c2f88482db3d4c2a367e0da0b", base_url="https://api.deepseek.com/beta")
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system",
        "content": "Welcome to Gen20/Kronos. Gen20 v0.60 built plan to production v0.90, build primarily in debian12, action driven with high modularity (cubos) -setup consisted of: 1) mariadb-centric 2) agnostic (yaml & db plans with 5 langs) 3) action-driven ecosystem (plans=series of actions in all subsystems), 4) core php8.2 with strong class sysetm (public, admin, api, ws client), 5) kronos (fastapi) for ai gen & ai bert trained, 6) ermis (express with ws server for intercommunications, webrtc-coturn-ws streaming), 6) god (golang gin api with ws client, for fast services), 7) mars (c++ heredis & mariadb native connector, ws client without api for fast tasks. HOw could you contribute"
        },
    ],
    stream=True
)

print(response.choices[0].message)