"""Chatbot service for agricultural assistance"""
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import json

from database.mongodb_setup import get_database
from services.kerala_market_service import KeralaMarketService
from services.groq_client import GroqClient
from services.weather_service import WeatherService

logger = logging.getLogger(__name__)


class ChatbotService:
    """Service for handling chatbot interactions"""
    
    # Class-level constant for intent keywords
    INTENT_KEYWORDS = {
        "weather": [
            "weather", "rain", "rainfall", "temperature", "humidity", 
            "forecast", "climate", "hot", "cold", "wind", "monsoon"
        ],
        "market": [
            # General market keywords
            "price", "market", "rate", "sell", "buy", "profit", 
            "wholesale", "retail", "mandi", "vegetable price", "crop price",
            "how much", "cost", "selling",
            # Common vegetables
            "tomato", "potato", "onion", "carrot", "cabbage", "cauliflower",
            "brinjal", "okra", "beans", "peas", "capsicum", "cucumber",
            "beetroot", "radish", "spinach", "coriander", "curry leaves",
            # Common fruits
            "banana", "mango", "apple", "orange", "grapes", "papaya",
            "pineapple", "watermelon", "pomegranate",
            # Spices
            "cardamom", "pepper", "turmeric", "ginger", "chilli", "garlic",
            # Grains
            "rice", "wheat", "maize", "corn"
        ],
        "disease": [
            "disease", "pest", "infection", "fungus", "virus", 
            "leaf spot", "yellowing", "rot", "blight"
        ],
        "scheme": [
            "scheme", "subsidy", "loan", "government", "pm kisan", 
            "insurance", "benefit", "support"
        ]
    }
    
    def __init__(self):
        self.groq = GroqClient()
        self.weather_service = WeatherService()
        self.market_service = KeralaMarketService()
        
        # Initialize context_data
        self.context_data = {
            "topics": list(self.INTENT_KEYWORDS.keys()) + ["general"],
            "languages": ["english", "hindi", "malayalam"]
        }
    
    async def get_response(
        self,
        message: str,
        language: str = "english",
        farmer_id: Optional[str] = None,
        location: Optional[str] = None
    ) -> str:
        """Generate chatbot response based on user message"""
        try:
            intent = self.detect_intent(message)
            live_data = None
            
            logger.info(f"Processing message with intent: {intent}")
            
            # Get live data based on intent
            if intent == "weather":
                logger.info("Fetching weather data...")
                live_data = await self._get_weather_data(location)
                print(live_data)
                logger.info(f"Weather data fetched: {bool(live_data)}")
                
            elif intent == "market":
                logger.info("Fetching market data...")
                live_data = await self._get_market_data(message)  # Pass user message
                print(live_data)
                logger.info(f"Market data fetched: {bool(live_data)}")
            
            # Get previous context if farmer_id provided
            previous_context = await self.get_recent_chat_context(farmer_id)
            
            # Build prompt with properly formatted data
            prompt = self.build_prompt(
                user_message=message,
                intent=intent,
                live_data=live_data,
                previous_context=previous_context,
                language=language
            )
            
            logger.info("Calling Groq API...")
            # Call Groq API
            response = await self.groq.generate(prompt)
            logger.info("Response generated successfully")
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}", exc_info=True)
            return self._get_error_response(language)
    
    async def _get_weather_data(self, location: Optional[str] = None) -> Optional[str]:
        """Get weather data and format it for the LLM"""
        try:
            # Call the weather service
            
            weather_response = self.weather_service.get_current_weather()
            
            # Check if the response is successful
            if not weather_response.get("success"):
                logger.warning(f"Weather API failed: {weather_response.get('error')}")
                return None
            
            # Extract the actual weather data
            weather_data = weather_response.get("data", {})
            
            if not weather_data:
                return None
            
            # Format weather data for LLM prompt
            formatted_weather = f"""
Current Weather Information:
- Location: {weather_data.get('location', 'Unknown')}, {weather_data.get('country', '')}
- Temperature: {weather_data.get('temperature', 'N/A')}°C (Feels like: {weather_data.get('feels_like', 'N/A')}°C)
- Conditions: {weather_data.get('weather', {}).get('description', 'N/A').title()}
- Humidity: {weather_data.get('humidity', 'N/A')}%
- Wind Speed: {weather_data.get('wind_speed', 'N/A')} m/s
- Pressure: {weather_data.get('pressure', 'N/A')} hPa
- Visibility: {weather_data.get('visibility', 'N/A')} km
"""
            
            return formatted_weather.strip()
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}", exc_info=True)
            return None
    
    async def _get_market_data(self, user_message: Optional[str] = None) -> Optional[str]:
        """Get market data and format it for the LLM"""
        try:
            # Get today's date
            today = datetime.now().strftime("%Y-%m-%d")
            
            # Extract crop name from user message if available
            crop_filter = None
            if user_message:
                crop_filter = self._extract_crop_name(user_message)
            
            logger.info(f"Fetching market data for date: {today}, crop_filter: {crop_filter}")
            
            # Call the market service (it's synchronous, so no await needed)
            market_response = self.market_service.get_market_data(
                start_date=today,
                end_date=today,
                crop_filter=crop_filter
            )
            
            # Check if the response is successful
            if not market_response.get("success"):
                logger.warning(f"Market API failed: {market_response.get('error')}")
                return "Market data is currently unavailable. Please try again later."
            
            # Extract the actual market data
            market_data = market_response.get("data", [])
            
            if not market_data:
                logger.warning("No market data available")
                if crop_filter:
                    return f"No market data found for '{crop_filter}' today. It might not be available in markets or the data hasn't been updated yet."
                return "No market data available for today. Please try again later."
            
            # Get vegetable column name
            veg_col = market_response.get("vegetable_column", "vegetablename")
            
            # Format market data for LLM prompt
            formatted_market = f"Current Market Prices ({today}):\n\n"
            
            # If crop filter is applied and we have results, show them prominently
            if crop_filter and len(market_data) <= 5:
                for i, item in enumerate(market_data):
                    veg_name = item.get(veg_col, 'Unknown')
                    wholesale = item.get('price', 'N/A')
                    retail = item.get('retailprice', 'N/A')
                    unit = item.get('units', 'kg')
                    
                    formatted_market += f"{i+1}. {veg_name}:\n"
                    formatted_market += f"   - Wholesale: ₹{wholesale}/{unit}\n"
                    formatted_market += f"   - Retail: ₹{retail}/{unit}\n\n"
            else:
                # Show more items if no specific filter or many results
                display_count = min(15, len(market_data))
                for i, item in enumerate(market_data[:display_count]):
                    veg_name = item.get(veg_col, 'Unknown')
                    wholesale = item.get('price', 'N/A')
                    retail = item.get('retailprice', 'N/A')
                    unit = item.get('units', 'kg')
                    
                    formatted_market += f"{i+1}. {veg_name}: Wholesale ₹{wholesale}/{unit}, Retail ₹{retail}/{unit}\n"
                
                if len(market_data) > display_count:
                    formatted_market += f"\n... and {len(market_data) - display_count} more items"
            
            formatted_market += f"\n\nTotal items available: {len(market_data)}"
            
            return formatted_market.strip()
            
        except Exception as e:
            logger.error(f"Error fetching market data: {e}", exc_info=True)
            return "Unable to fetch market data due to a technical error."
    
    def _extract_crop_name(self, message: str) -> Optional[str]:
        """Extract crop/vegetable name from user message"""
        # Common crop names to look for
        crop_keywords = [
            "cardamom", "pepper", "turmeric", "ginger", "chilli", "garlic",
            "tomato", "potato", "onion", "carrot", "cabbage", "cauliflower",
            "brinjal", "okra", "beans", "peas", "capsicum", "cucumber",
            "beetroot", "radish", "spinach", "coriander", "curry leaves",
            "banana", "mango", "apple", "orange", "grapes", "papaya",
            "pineapple", "watermelon", "pomegranate",
            "rice", "wheat", "maize", "corn"
        ]
        
        message_lower = message.lower()
        
        # Look for crop names in the message
        for crop in crop_keywords:
            if crop in message_lower:
                return crop
        
        return None
    
    def build_prompt(
        self,
        user_message: str,
        intent: str,
        live_data: Optional[str],
        previous_context: List[Dict[str, Any]],
        language: str
    ) -> str:
        """Build prompt for LLM"""
        
        # Build live data section
        live_section = ""
        if live_data:
            live_section = f"""
═══════════════════════════════════════════════════════
REAL-TIME DATA (MUST USE THIS INFORMATION):
═══════════════════════════════════════════════════════
{live_data}
═══════════════════════════════════════════════════════
"""
        
        
        # Build context section
        context_section = ""
        if previous_context:
            # Convert datetime objects to strings for JSON serialization
            serializable_context = []
            for msg in previous_context:
                msg_copy = msg.copy()
                if 'timestamp' in msg_copy and hasattr(msg_copy['timestamp'], 'isoformat'):
                    msg_copy['timestamp'] = msg_copy['timestamp'].isoformat()
                serializable_context.append(msg_copy)
            
            context_section = f"""
Previous conversation context:
{json.dumps(serializable_context, indent=2)}
"""
        
        # Build the main prompt
        prompt = f"""You are Krishi Saathi, an intelligent agricultural assistant for Indian farmers.

Response Language: {language}
Detected Intent: {intent}

{live_section}

{context_section}

User's Question: {user_message}

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:

1. ⚠️ **ALWAYS USE THE REAL-TIME DATA ABOVE** ⚠️
   - If market prices are shown above, you MUST quote those exact prices
   - If weather data is shown above, you MUST use those exact values
   - DO NOT say "check the market section" - USE THE DATA PROVIDED

2. **NEVER MAKE UP OR GUESS DATA**
   - Do not invent prices or weather information
   - If specific data is missing, say so clearly
   - Only use information from the REAL-TIME DATA section above

3. **BE DIRECT AND SPECIFIC**
   - Start with the answer immediately
   - Use exact numbers from the data
   - Example: "Cardamom wholesale price is ₹850/kg and retail is ₹900/kg today in markets"
   - NOT: "Check our market section for prices"

4. **FORMAT YOUR RESPONSE**
   - For market queries: State the prices clearly with wholesale and retail rates
   - For weather queries: Give temperature, humidity, and conditions
   - Add brief farming advice based on the data

5. **LANGUAGE**: Respond in {language}

6. **LENGTH**: 2-4 concise paragraphs maximum

REMEMBER: You have access to real-time data above. Use it! Don't redirect users elsewhere.

Now answer the farmer's question using the real-time data provided:"""
        
        return prompt
    
    def detect_intent(self, message: str) -> str:
        """Detect user intent from message"""
        msg = message.lower()
        for intent, keywords in self.INTENT_KEYWORDS.items():
            if any(keyword in msg for keyword in keywords):
                return intent
        return "general"
    
    async def get_recent_chat_context(
        self, 
        farmer_id: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Get recent chat history for context"""
        if not farmer_id:
            return []
        
        try:
            db = await get_database()
            farmer = await db.farmers.find_one(
                {"farmer_id": farmer_id},
                {"chat_history": {"$slice": -3}}
            )
            
            return farmer.get("chat_history", []) if farmer else []
        except Exception as e:
            logger.error(f"Error fetching chat context: {e}")
            return []
    
    def _get_error_response(self, language: str) -> str:
        """Get error response in appropriate language"""
        responses = {
            "english": "I apologize, but I encountered an error processing your request. Please try again in a moment.",
            "hindi": "क्षमा करें, आपके अनुरोध को संसाधित करने में एक त्रुटि हुई। कृपया एक क्षण में पुनः प्रयास करें।",
            "malayalam": "ക്ഷമിക്കണം, നിങ്ങളുടെ അഭ്യർത്ഥന പ്രോസസ്സ് ചെയ്യുന്നതിൽ ഒരു പിശക് സംഭവിച്ചു. ദയവായി ഒരു നിമിഷത്തിനുശേഷം വീണ്ടും ശ്രമിക്കുക."
        }
        return responses.get(language, responses["english"])
    
    def _get_weather_response(self, language: str) -> str:
        """Get weather-related response"""
        responses = {
            "english": "I can help you with weather information! Check the Weather Forecast section for current conditions and 7-day predictions.",
            "hindi": "मैं मौसम की जानकारी में आपकी मदद कर सकता हूं! वर्तमान स्थितियों और 7-दिन की भविष्यवाणियों के लिए मौसम पूर्वानुमान अनुभाग देखें।",
            "malayalam": "കാലാവസ്ഥാ വിവരങ്ങളിൽ എനിക്ക് നിങ്ങളെ സഹായിക്കാം! നിലവിലെ അവസ്ഥകൾക്കും 7 ദിവസത്തെ പ്രവചനങ്ങൾക്കും കാലാവസ്ഥാ പ്രവചന വിഭാഗം പരിശോദിക്കുക."
        }
        return responses.get(language, responses["english"])
    
    async def get_context(self) -> Dict[str, Any]:
        """Get chatbot context information"""
        try:
            return {
                "success": True,
                "context": self.context_data,
                "available_topics": self.context_data["topics"],
                "supported_languages": self.context_data["languages"]
            }
        except Exception as e:
            logger.error(f"Error getting chatbot context: {e}")
            return {
                "success": False,
                "error": str(e)
            }