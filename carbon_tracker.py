import os
import logging
from typing import Dict, List
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase credentials are not set in environment")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Emission factors in kg CO2e per km
EMISSION_FACTORS = {
    "car": 0.171,
    "bus": 0.104,
    "train": 0.041,
    "bike": 0.0,
    "walk": 0.0,
}

# Home energy factors in kg CO2e per kWh
ENERGY_FACTORS = {
    "electricity": 0.233,
    "gas": 0.202,
}

def calculate_transport_emissions(distance_km: float, mode: str) -> float:
    factor = EMISSION_FACTORS.get(mode, 0)
    return round(distance_km * factor, 3)

def calculate_home_energy_emissions(electricity_kwh: float, gas_kwh: float) -> float:
    return round(electricity_kwh * ENERGY_FACTORS["electricity"] + gas_kwh * ENERGY_FACTORS["gas"], 3)

def save_footprint(user_id: str, data: Dict) -> None:
    client = get_supabase_client()
    response = client.table("footprints").insert({"user_id": user_id, **data}).execute()
    logger.info("Saved footprint: %s", response)

def get_user_history(user_id: str) -> List[Dict]:
    client = get_supabase_client()
    response = client.table("footprints").select("*").eq("user_id", user_id).execute()
    return response.data or []

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Simple carbon footprint tracker")
    parser.add_argument("user", help="User identifier")
    parser.add_argument("--distance", type=float, default=0.0, help="Daily travel distance in km")
    parser.add_argument("--mode", type=str, default="car", help="Travel mode: car, bus, train, bike, walk")
    parser.add_argument("--electricity", type=float, default=0.0, help="Electricity usage in kWh")
    parser.add_argument("--gas", type=float, default=0.0, help="Gas usage in kWh")

    args = parser.parse_args()

    transport = calculate_transport_emissions(args.distance, args.mode)
    home = calculate_home_energy_emissions(args.electricity, args.gas)
    total = round(transport + home, 3)

    record = {
        "transport": transport,
        "home": home,
        "total": total,
    }

    save_footprint(args.user, record)
    print(f"Recorded footprint for {args.user}: {record}")
