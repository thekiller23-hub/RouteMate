from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .engine import calculate_route_match
from .models import RouteMatch
from apps.journeys.models import Journey
from apps.journeys.serializers import JourneySerializer
from apps.requests_app.models import ProductRequest
from apps.requests_app.serializers import ProductRequestSerializer

class MatchingRequestsForTravellerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        journey_id = request.query_params.get('journey_id')

        journeys = Journey.objects.filter(status='ACTIVE')
        if not user.is_admin():
            journeys = journeys.filter(traveller=user)

        if journey_id:
            journeys = journeys.filter(id=journey_id)

        if not journeys.exists():
            return Response({'matches': [], 'message': 'No active journeys found to match against.'})

        open_requests = ProductRequest.objects.filter(status__in=['OPEN', 'MATCHED'])

        results = []
        for journey in journeys:
            for req in open_requests:
                # Don't match user's own requests
                if req.requester == user:
                    continue

                eval_result = calculate_route_match(journey, req)
                if eval_result.get('is_match'):
                    # Persist match
                    match_obj, _ = RouteMatch.objects.update_or_create(
                        journey=journey,
                        request=req,
                        defaults={
                            'match_score': eval_result['match_score'],
                            'detour_distance_km': eval_result['estimated_detour_km'],
                            'estimated_travel_time_hours': eval_result['estimated_travel_time_hours'],
                            'compatibility_details': eval_result
                        }
                    )

                    req_data = ProductRequestSerializer(req).data
                    journey_data = JourneySerializer(journey).data
                    results.append({
                        'match_id': match_obj.id,
                        'journey': journey_data,
                        'request': req_data,
                        'match_score': eval_result['match_score'],
                        'estimated_detour_km': eval_result['estimated_detour_km'],
                        'estimated_travel_time_hours': eval_result['estimated_travel_time_hours'],
                        'factors': eval_result['factors'],
                        'pickup_compatibility': eval_result['pickup_compatibility'],
                        'destination_compatibility': eval_result['destination_compatibility']
                    })

        # Sort descending by match score
        results.sort(key=lambda x: x['match_score'], reverse=True)
        return Response({'matches': results, 'total_matches': len(results)})

class MatchingTravellersForRequesterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        request_id = request.query_params.get('request_id')

        if not request_id:
            return Response({'error': 'Please provide request_id query parameter.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prod_req = ProductRequest.objects.get(id=request_id)
        except ProductRequest.DoesNotExist:
            return Response({'error': 'Product request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if prod_req.requester != user and not user.is_admin():
            return Response({'error': 'Not authorized to view matching for this request.'}, status=status.HTTP_403_FORBIDDEN)

        active_journeys = Journey.objects.filter(status='ACTIVE').exclude(traveller=user)

        results = []
        for journey in active_journeys:
            eval_result = calculate_route_match(journey, prod_req)
            if eval_result.get('is_match'):
                journey_data = JourneySerializer(journey).data
                results.append({
                    'journey': journey_data,
                    'match_score': eval_result['match_score'],
                    'estimated_detour_km': eval_result['estimated_detour_km'],
                    'estimated_travel_time_hours': eval_result['estimated_travel_time_hours'],
                    'factors': eval_result['factors'],
                    'pickup_compatibility': eval_result['pickup_compatibility'],
                    'destination_compatibility': eval_result['destination_compatibility']
                })

        results.sort(key=lambda x: x['match_score'], reverse=True)
        return Response({'matches': results, 'total_matches': len(results)})

