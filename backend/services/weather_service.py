"""Weather service for weather-related operations"""

import os
import requests
from typing import Dict, Any, Optional
from utils.response_utils import create_success_response, create_error_response
from utils.location_utils import detect_kerala_location, get_api_friendly_location
from datetime import datetime

class WeatherService:
    """Service for weather operations"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY", "")
        self.base_url = "http://api.openweathermap.org/data/2.5"
    
    def get_current_weather(
        self, 
        lat: Optional[float] = None, 
        lon: Optional[float] = None, 
        city: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get current weather data"""
        try:
            if not self.api_key:
                return create_error_response("Weather API key not configured")
            
            # Build API URL based on provided parameters
            if lat is not None and lon is not None:
                url = f"{self.base_url}/weather?lat={lat}&lon={lon}&appid={self.api_key}&units=metric"
            elif city:
                url = f"{self.base_url}/weather?q={city}&appid={self.api_key}&units=metric"
            else:
                # Default to Mumbai, Maharashtra
                url = f"{self.base_url}/weather?q=Mumbai,Maharashtra,India&appid={self.api_key}&units=metric"
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                weather_info = {
    "location": data.get("name", "Unknown"),
    "country": data["sys"]["country"],
    "temperature": data["main"]["temp"],
    "feels_like": data["main"]["feels_like"],
    "humidity": data["main"]["humidity"],
    "pressure": data["main"]["pressure"],
    "visibility": data.get("visibility", 0) / 1000,
    "wind_speed": data.get("wind", {}).get("speed", 0),
    "wind_direction": data.get("wind", {}).get("deg", 0),
    "sunrise": data["sys"]["sunrise"],
    "sunset": data["sys"]["sunset"],
    "weather": {
        "description": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"],
    },
}

                
                return create_success_response(data=weather_info)
            else:
                return create_error_response(f"Weather API error: {response.status_code}")
                
        except Exception as e:
            return create_error_response(f"Error fetching weather data: {str(e)}")
    
    def get_weather_forecast(
        self, 
        lat: Optional[float] = None,
        lon: Optional[float] = None, 
        city: Optional[str] = None,
        days: int = 5
    ) -> Dict[str, Any]:
        """Get weather forecast"""
        try:
            if not self.api_key:
                return create_error_response("Weather API key not configured")
            
            # Build API URL
            if lat is not None and lon is not None:
                url = f"{self.base_url}/forecast?lat={lat}&lon={lon}&appid={self.api_key}&units=metric"
            elif city:
                url = f"{self.base_url}/forecast?q={city}&appid={self.api_key}&units=metric"
            else:
                url = f"{self.base_url}/forecast?q=Mumbai,Maharashtra,India&appid={self.api_key}&units=metric"
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                from datetime import datetime

                forecast_list = []
                daily_data = {}

                for item in data["list"]:
                    date = item["dt_txt"].split(" ")[0]

                    if date not in daily_data:
                        daily_data[date] = {
                            "date": date,
                            "day_name": datetime.strptime(date, "%Y-%m-%d").strftime("%A"),
                            "temperature": {
                                "max": item["main"]["temp_max"],
                                "min": item["main"]["temp_min"],
                            },
                            "humidity": item["main"]["humidity"],
                            "wind_speed": item.get("wind", {}).get("speed", 0),
                            "precipitation": item.get("rain", {}).get("3h", 0),
                            "weather": {
                                "description": item["weather"][0]["description"],
                                "icon": item["weather"][0]["icon"],
                            },
                        }
                    else:
                        daily_data[date]["temperature"]["max"] = max(
                            daily_data[date]["temperature"]["max"],
                            item["main"]["temp_max"]
                        )
                        daily_data[date]["temperature"]["min"] = min(
                            daily_data[date]["temperature"]["min"],
                            item["main"]["temp_min"]
                        )

                forecast_list = list(daily_data.values())[:days]

                
                return create_success_response(
                    data={
                        "location": data["city"]["name"],
                        "forecast": forecast_list
                    }
                )

            else:
                return create_error_response(f"Weather API error: {response.status_code}")
                
        except Exception as e:
            return create_error_response(f"Error fetching weather forecast: {str(e)}")
    
    def get_weather_by_location(self, location: str) -> Dict[str, Any]:
        """Get weather for a specific location"""
        api_location = get_api_friendly_location(location)
        return self.get_current_weather(city=f"{api_location}, Maharashtra, India")