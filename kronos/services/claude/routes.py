import logging
from fastapi import APIRouter, HTTPException, Security, Depends, status
from fastapi.security.api_key import APIKeyHeader, APIKey
from pydantic import BaseModel
from typing import List, Dict, Optional
from uuid import uuid4, UUID

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

# API Key configuration
API_KEY = "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"
API_KEY_NAME = "vivalibro"

api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# In-memory storage for conversations
conversations: Dict[UUID, List[Dict[str, str]]] = {"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"}

class Message(BaseModel):
    content: str

class Conversation(BaseModel):
    id: UUID
    messages: List[Dict[str, str]]

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate credentials"
    )
@router.post("/conversations/{conversation_id}/messages", response_model=dict)
async def add_message(
    conversation_id: UUID,
    message: Message,
    api_key: APIKey = Depends(get_api_key)
):
    logger.debug(f"Adding message to conversation {conversation_id}")
    if conversation_id not in conversations:
        conversations[conversation_id] = []
    conversations[conversation_id].append({"role": "user", "content": message.content})
    logger.debug(f"Message added to conversation {conversation_id}")
    return {"id": str(conversation_id), "message": message.content}

@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: UUID,
    api_key: APIKey = Depends(get_api_key)
):
    logger.debug(f"Retrieving conversation {conversation_id}")
    if conversation_id not in conversations:
        logger.warning(f"Conversation {conversation_id} not found")
        raise HTTPException(status_code=404, detail="Conversation not found")
    logger.debug(f"Retrieved conversation {conversation_id}")
    return Conversation(id=conversation_id, messages=conversations[conversation_id])

# This function is to be used in the main FastAPI app
def include_router(app):
    app.include_router(router, prefix="/apy/v1/claude")