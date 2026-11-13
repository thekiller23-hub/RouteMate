from rest_framework import permissions

class IsRequester(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'REQUESTER' or request.user.is_admin()))

class IsTraveller(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'TRAVELLER' or request.user.is_admin()))

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin())

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin():
            return True
        user_field = getattr(obj, 'user', None) or getattr(obj, 'requester', None) or getattr(obj, 'traveller', None)
        return user_field == request.user

