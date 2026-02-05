from datetime import datetime
import uuid

# IMPORTANT: import database from your existing mongodb setup
from database.mongodb_setup import get_database


async def save_chat_history(
    farmer_id: str,
    user_message: str,
    bot_response: str,
    language: str,
    topic: str = "general"
):
    """Save chat history to MongoDB"""
    try:
        db = await get_database()
        
        if db is None:
            print("❌ Database connection is None, cannot save chat history")
            return False

        chat_entry = {
            "message_id": f"msg_{uuid.uuid4().hex[:8]}",
            "user_message": user_message,
            "bot_response": bot_response,
            "language": language,
            "timestamp": datetime.utcnow(),
            "topic": topic,
            "helpful": True
        }
        
        print(f"💬 Saving chat entry for farmer_id: {farmer_id}")
        print(f"   Message: {user_message[:50]}...")
        
        # Check if farmer exists
        farmer = await db.farmers.find_one({"farmer_id": farmer_id})
        
        if not farmer:
            print(f"❌ Farmer not found with farmer_id: {farmer_id}")
            return False
        
        print(f"✅ Found farmer: {farmer.get('name', 'Unknown')}")

        # Update farmer's chat history
        result = await db.farmers.update_one(
            {"farmer_id": farmer_id},
            {"$push": {"chat_history": chat_entry}}
        )
        
        if result.modified_count > 0:
            print(f"✅ Chat history saved successfully for farmer_id: {farmer_id}")
            print(f"   Modified count: {result.modified_count}")
            return True
        else:
            print(f"⚠️ Chat history update failed - no documents modified for farmer_id: {farmer_id}")
            print(f"   Matched count: {result.matched_count}")
            return False
            
    except Exception as e:
        print(f"❌ Error saving chat history: {e}")
        import traceback
        traceback.print_exc()
        return False


async def get_chat_history(farmer_id: str, limit: int = 10):
    """Retrieve chat history from MongoDB for a farmer"""
    try:
        db = await get_database()
        
        if db is None:
            print("❌ Database connection is None, cannot retrieve chat history")
            return []
        
        # Find farmer and get chat history
        farmer = await db.farmers.find_one(
            {"farmer_id": farmer_id},
            {"chat_history": {"$slice": -limit}}  # Get last N messages
        )
        
        if not farmer:
            print(f"❌ Farmer not found with farmer_id: {farmer_id}")
            return []
        
        chat_history = farmer.get("chat_history", [])
        print(f"✅ Retrieved {len(chat_history)} chat messages for farmer: {farmer_id}")
        
        return chat_history
        
    except Exception as e:
        print(f"❌ Error retrieving chat history: {e}")
        import traceback
        traceback.print_exc()
        return []

