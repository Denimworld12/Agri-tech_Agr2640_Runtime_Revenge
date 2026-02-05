"""Combined market analytics API routes"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import asyncio

from services.kerala_market_service import KeralaMarketService
from services.market_locator_service import market_locator_service

router = APIRouter(prefix="/api/market-analytics", tags=["market-analytics"])

class CombinedMarketRequest(BaseModel):
    start_date: str
    end_date: Optional[str] = None
    selected_crops: List[str] = []
    farmer_location: Optional[str] = None
    limit: int = 100

@router.post("/combined")
async def get_combined_market_analytics(request: CombinedMarketRequest):
    """
    Get combined market analytics in a single request:
    1. Market Data (prices)
    2. Analysis (trends & tips)
    3. Nearby Markets
    """
    try:
        # 1. Fetch Market Data
        # Run this in thread pool since it might be blocking (requests library)
        # In a real async app, we'd use aiohttp
        market_data_result = await asyncio.to_thread(
            KeralaMarketService.get_market_data,
            start_date=request.start_date,
            end_date=request.end_date,
            crop_filter=None # We'll filter later or let client handle it
        )
        
        if not market_data_result.get("success"):
            raise HTTPException(status_code=400, detail=market_data_result.get("error"))
            
        data = market_data_result.get("data", [])
        vegetable_column = market_data_result.get("vegetable_column")
        
        # 2. Analyze Data (if crops selected)
        analysis_result = {}
        if request.selected_crops and data and vegetable_column:
            # Also run analysis in thread pool as it's CPU bound
            analysis_result = await asyncio.to_thread(
                KeralaMarketService.analyze_market_data,
                data=data,
                selected_crops=request.selected_crops,
                vegetable_column=vegetable_column
            )
        
        # 3. Find Nearby Markets (if crops selected)
        nearby_markets_result = {}
        if request.selected_crops:
            # This is already async compatible or fast enough
            nearby_markets_result = market_locator_service.find_nearby_markets(
                selected_crops=request.selected_crops,
                farmer_location=request.farmer_location,
                limit=10  # Reasonable default for UI
            )
            
        return {
            "success": True,
            "market_data": market_data_result,
            "analysis": analysis_result,
            "nearby_markets": nearby_markets_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
