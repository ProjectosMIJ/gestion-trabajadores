from django.urls import path
from .views.user_views import user_detail, login_view, get,register_view, usuarios

urlpatterns = [
    path('login/', login_view),
    path('register/', register_view),
    path('users/<int:user_id>/', user_detail),
    path('get/', get),
    path('usuarios/', usuarios), 
]
