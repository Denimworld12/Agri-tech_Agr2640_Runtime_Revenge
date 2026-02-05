from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.weather_service import WeatherService

router = APIRouter(prefix="/api/weather", tags=["weather"])

weather_service = WeatherService()

@router.get("/current")
async def get_current_weather(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    city: Optional[str] = Query(None),
):
    if not city and (lat is None or lon is None):
        raise HTTPException(
            status_code=400,
            detail="Provide either city or lat & lon"
        )

    return weather_service.get_current_weather(lat, lon, city)


@router.get("/forecast")
async def get_weather_forecast(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    city: Optional[str] = Query(None),
    days: int = Query(5, ge=1, le=7),
):
    if not city and (lat is None or lon is None):
        raise HTTPException(
            status_code=400,
            detail="Provide either city or lat & lon"
        )

    return weather_service.get_weather_forecast(lat, lon, city, days)
