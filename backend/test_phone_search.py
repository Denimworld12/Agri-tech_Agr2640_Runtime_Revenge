import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from database.mongodb_setup import get_database
import os
from dotenv import load_dotenv

load_dotenv()

async def test_phone_search():
    """Test to find farmer with phone 7083113156"""
    
    db = await get_database()
    
    if not db:
        print("❌ Failed to connect to database")
        return
    
    phone = "7083113156"
    
    print(f"\n🔍 Searching for phone: {phone}\n")
    
    # Try searching with personal_details.phone (new structure)
    print("1️⃣  Searching with 'personal_details.phone' (NEW STRUCTURE):")
    farmer_new = await db.farmers.find_one({"personal_details.phone": phone})
    if farmer_new:
        farmer_new.pop('_id', None)
        print(f"   ✅ FOUND: {farmer_new}")
    else:
        print(f"   ❌ Not found")
    
    # Try searching with phone at root level (old structure)
    print("\n2️⃣  Searching with 'phone' (OLD STRUCTURE):")
    farmer_old = await db.farmers.find_one({"phone": phone})
    if farmer_old:
        farmer_old.pop('_id', None)
        print(f"   ✅ FOUND: {farmer_old}")
    else:
        print(f"   ❌ Not found")
    
    # Search all farmers with this phone anywhere
    print("\n3️⃣  Searching all farmers to find this phone:")
    all_farmers = await db.farmers.find({}).to_list(None)
    print(f"   Total farmers: {len(all_farmers)}")
    
    for farmer in all_farmers:
        farmer_id = farmer.get('farmer_id', 'NO_ID')
        
        # Check both locations
        phone_root = farmer.get('phone')
        phone_nested = farmer.get('personal_details', {}).get('phone')
        
        if phone_root == phone or phone_nested == phone:
            farmer.pop('_id', None)
            print(f"\n   ✅ FOUND FARMER: {farmer_id}")
            print(f"      Root phone: {phone_root}")
            print(f"      Nested phone: {phone_nested}")
            print(f"      Full data: {farmer}")

if __name__ == "__main__":
    asyncio.run(test_phone_search())
