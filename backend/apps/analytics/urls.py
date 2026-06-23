from django.urls import path
from .views import DashboardOverviewView, DashboardLiveView, DashboardExportView

urlpatterns = [
    # [STATIC]  Dữ liệu nặng, cache 5 phút
    path('overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),

    # [DYNAMIC] Dữ liệu real-time, cache 30 giây, frontend poll mỗi 30s
    path('live/', DashboardLiveView.as_view(), name='dashboard-live'),

    # [EXPORT]  Xuất báo cáo Excel/PDF
    path('export/', DashboardExportView.as_view(), name='dashboard-export'),
]
