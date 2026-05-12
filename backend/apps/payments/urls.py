from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, DepositViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'deposits', DepositViewSet, basename='deposit')

urlpatterns = [
    path('', include(router.urls)),
]
