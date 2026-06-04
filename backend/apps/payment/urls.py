from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransactionViewSet, DepositViewSet, CardAdminViewSet,
    ManualDepositAdminView, CardRedeemView
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'deposits', DepositViewSet, basename='deposit')
router.register(r'cards', CardAdminViewSet, basename='card')

urlpatterns = [
    path('manual-deposit/', ManualDepositAdminView.as_view(), name='manual-deposit'),
    path('cards/redeem/', CardRedeemView.as_view(), name='card-redeem'),
    path('', include(router.urls)),
]
