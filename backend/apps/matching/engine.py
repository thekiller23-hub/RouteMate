import math
from datetime import datetime
from django.utils import timezone

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in km."""
    if None in (lat1, lon1, lat2, lon2):
        return None
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_route_match(journey, product_request):
    """
    Evaluates compatibility between a Journey and a ProductRequest.
    Returns dict with match_score (0-100), detour_distance_km, eta, factors, and compatibility notes.
    """
    factors = []
    base_score = 0
    pickup_compat = 'NONE'
    dest_compat = 'NONE'
    detour_km = 0.0

    j_origin = (journey.origin_city or '').strip().lower()
    j_dest = (journey.destination_city or '').strip().lower()
    r_pickup = (product_request.pickup_city or '').strip().lower()
    r_dest = (product_request.destination_city or '').strip().lower()

    # Parse intermediate stops if any
    stops = []
    if isinstance(journey.intermediate_stops, list):
        for s in journey.intermediate_stops:
            if isinstance(s, dict):
                stops.append(s.get('city', '').lower())
            elif isinstance(s, str):
                stops.append(s.lower())

    # 1. Pickup compatibility
    if j_origin == r_pickup:
        base_score += 45
        pickup_compat = 'EXACT_ORIGIN'
        factors.append(f"Origin exactly matches pickup location ({product_request.pickup_city})")
    elif r_pickup in stops:
        base_score += 35
        pickup_compat = 'WAYPOINT_STOP'
        factors.append(f"Pickup location is on traveller's scheduled route stop ({product_request.pickup_city})")
        detour_km += 5.0
    else:
        # Check coordinate distance if available
        dist = haversine_distance(journey.origin_lat, journey.origin_lng, product_request.pickup_lat, product_request.pickup_lng)
        if dist is not None and dist <= 30.0:
            base_score += int(30 * (1 - dist / 30.0))
            pickup_compat = 'VICINITY'
            detour_km += round(dist, 1)
            factors.append(f"Pickup location is within {round(dist, 1)}km of departure")

    # 2. Destination compatibility
    if j_dest == r_dest:
        base_score += 45
        dest_compat = 'EXACT_DESTINATION'
        factors.append(f"Destination exactly matches delivery city ({product_request.destination_city})")
    elif r_dest in stops:
        base_score += 35
        dest_compat = 'WAYPOINT_STOP'
        factors.append(f"Delivery destination is on traveller's scheduled route stop ({product_request.destination_city})")
        detour_km += 5.0
    else:
        dist = haversine_distance(journey.destination_lat, journey.destination_lng, product_request.destination_lat, product_request.destination_lng)
        if dist is not None and dist <= 30.0:
            base_score += int(30 * (1 - dist / 30.0))
            dest_compat = 'VICINITY'
            detour_km += round(dist, 1)
            factors.append(f"Destination is within {round(dist, 1)}km of traveller arrival")

    # If neither pickup nor destination has any match, not compatible
    if pickup_compat == 'NONE' or dest_compat == 'NONE':
        return {
            'is_match': False,
            'match_score': 0,
            'reasons': ['Route does not align with request pickup and delivery points']
        }

    # 3. Schedule Compatibility
    j_departure_date = journey.departure_datetime.date()
    r_required_date = product_request.required_delivery_date

    if j_departure_date <= r_required_date:
        base_score += 10
        factors.append(f"Traveller arrives on or before required delivery date ({r_required_date})")
    else:
        # Penalize if departure is after deadline
        diff_days = (j_departure_date - r_required_date).days
        base_score -= min(30, diff_days * 10)
        factors.append(f"Traveller departs {diff_days} day(s) after requested delivery deadline")

    # 4. Carrying capacity
    if journey.carrying_capacity_kg >= 2.0:
        factors.append(f"Traveller has {journey.carrying_capacity_kg}kg capacity available")

    # Clamp match score between 0 and 100
    final_score = max(0, min(100, base_score))

    # Travel time estimate based on travel mode
    mode_speed = {
        'FLIGHT': 500,
        'TRAIN': 75,
        'CAR': 65,
        'BUS': 50,
        'BIKE': 45
    }
    speed = mode_speed.get(journey.travel_mode, 60)
    est_hours = round(max(1.0, (detour_km + 50) / speed), 1)

    return {
        'is_match': final_score >= 40,
        'match_score': final_score,
        'pickup_compatibility': pickup_compat,
        'destination_compatibility': dest_compat,
        'estimated_detour_km': round(detour_km, 1),
        'estimated_travel_time_hours': est_hours,
        'travel_mode': journey.travel_mode,
        'factors': factors
    }

