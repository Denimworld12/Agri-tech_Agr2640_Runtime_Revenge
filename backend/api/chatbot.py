from fastapi import APIRouter, HTTPException
from models.chat_models import ChatMessage, ChatResponse
from services.chatbot_service import ChatbotService
from datetime import datetime

router = APIRouter(prefix="/api", tags=["chatbot"])

# Initialize chatbot service
chatbot_service = ChatbotService()


from fastapi import Depends
from datetime import datetime

from api.auth import verify_jwt_token
from services.chat_history_service import save_chat_history



@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    message: ChatMessage,
    current_farmer: dict = Depends(verify_jwt_token)
):
    """Handle chat requests with bot and save to MongoDB"""
    try:
        # Get farmer_id from authenticated user
        farmer_id = current_farmer["farmer_id"]
        
        print(f"🤖 Processing chat for farmer_id: {farmer_id}")
        print(f"   Message: {message.message[:50]}...")
        
        # Get response from chatbot service (pass farmer_id for context)
        response_text = await chatbot_service.get_response(
            message=message.message,
            language=message.language,
            farmer_id=farmer_id  # Pass farmer_id for chat context
        )
        
        print(f"✅ Bot response generated: {response_text[:50]}...")

        # Save chat to MongoDB
        save_success = await save_chat_history(
            farmer_id=farmer_id,
            user_message=message.message,
            bot_response=response_text,
            language=message.language
        )
        
        if save_success:
            print(f"✅ Chat history saved to MongoDB for farmer: {farmer_id}")
        else:
            print(f"⚠️ Failed to save chat history to MongoDB for farmer: {farmer_id}")

        return ChatResponse(
            response=response_text,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Chat processing failed: {str(e)}"
        )
