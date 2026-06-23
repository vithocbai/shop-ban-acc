from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta, datetime
from django.db.models import Sum
from django.utils.dateparse import parse_date
import io
import openpyxl
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from django.http import HttpResponse
import logging

logger = logging.getLogger(__name__)

from apps.user.models import User
from apps.order.models import Order
from apps.payment.models import Transaction
from apps.account.models import Account


def _parse_date_range(request, default_days=7):
    """Helper: Parse start_date, end_date từ query params."""
    now = timezone.now()
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')

    start_date = parse_date(start_date_str) if start_date_str else (now - timedelta(days=default_days)).date()
    end_date = parse_date(end_date_str) if end_date_str else now.date()

    end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
    start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
    return start_date, end_date, start_dt, end_dt


class DashboardOverviewView(APIView):
    """
    [STATIC] Trả về dữ liệu nặng, ít thay đổi.
    Cache 5 phút. Mỗi section được bọc try/except riêng →
    1 section lỗi không làm sập toàn bộ dashboard.

    Sections:
      - summary_cards: KPI cards (doanh thu, đơn hàng, users, nạp tiền)
      - revenue_chart: Biểu đồ theo ngày
      - quick_stats:   Thống kê tài khoản
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        game_id = request.query_params.get('game_id')

        cache_key = f'dashboard_overview_{start_date_str}_{end_date_str}_{game_id}'
        cached = cache.get(cache_key)
        if cached:
            return Response({"success": True, "data": cached, "from_cache": True})

        start_date, end_date, start_dt, end_dt = _parse_date_range(request)

        data = {
            "summary_cards": None,
            "revenue_chart": None,
            "quick_stats": None,
        }

        # --- Section 1: Summary Cards ---
        try:
            order_qs = Order.objects.filter(created_at__range=(start_dt, end_dt))
            if game_id:
                order_qs = order_qs.filter(items__account__game_id=game_id)

            total_revenue = (
                order_qs.filter(payment_status=Order.PaymentStatus.PAID)
                .aggregate(Sum('total_price'))['total_price__sum'] or 0
            )
            trans_qs = Transaction.objects.filter(created_at__range=(start_dt, end_dt))
            total_deposits = (
                trans_qs.filter(type=Transaction.Type.DEPOSIT, status=Transaction.Status.SUCCESS)
                .aggregate(Sum('amount'))['amount__sum'] or 0
            )
            new_users = User.objects.filter(created_at__range=(start_dt, end_dt)).count()

            data["summary_cards"] = {
                "total_revenue": float(total_revenue),
                "total_orders": order_qs.count(),
                "accounts_sold": order_qs.filter(payment_status=Order.PaymentStatus.PAID).count(),
                "new_users": new_users,
                "total_deposits": float(total_deposits),
            }
        except Exception as e:
            logger.error(f"[Dashboard/overview] summary_cards error: {e}")
            data["summary_cards"] = None  # Widget sẽ hiện trạng thái lỗi riêng

        # --- Section 2: Revenue Chart ---
        try:
            days_diff = min((end_date - start_date).days, 30)
            revenue_chart = []
            for i in range(days_diff, -1, -1):
                day = end_date - timedelta(days=i)
                revenue_chart.append({
                    "date": day.strftime("%d/%m"),
                    "revenue": 0,
                    "orders": 0,
                })
            data["revenue_chart"] = revenue_chart
        except Exception as e:
            logger.error(f"[Dashboard/overview] revenue_chart error: {e}")
            data["revenue_chart"] = None

        # --- Section 3: Quick Stats ---
        try:
            data["quick_stats"] = {
                "selling_accounts": Account.objects.filter(status=Account.Status.AVAILABLE).count(),
                "sold_accounts": Account.objects.filter(status=Account.Status.SOLD).count(),
                "locked_accounts": 0,
                "hidden_accounts": 0,
            }
        except Exception as e:
            logger.error(f"[Dashboard/overview] quick_stats error: {e}")
            data["quick_stats"] = None

        cache.set(cache_key, data, timeout=300)  # 5 phút
        return Response({"success": True, "data": data, "from_cache": False})


class DashboardLiveView(APIView):
    """
    [DYNAMIC] Trả về dữ liệu thay đổi liên tục.
    Cache 30 giây. Frontend poll mỗi 30s.

    Sections:
      - recent_orders: 10 đơn hàng mới nhất
      - online_users:  Placeholder (cần WebSocket/Redis sau)
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        cache_key = 'dashboard_live_data'
        cached = cache.get(cache_key)
        if cached:
            return Response({"success": True, "data": cached, "from_cache": True})

        data = {
            "recent_orders": None,
            "online_users": 0,
        }

        # --- Recent Orders ---
        try:
            recent_orders = Order.objects.select_related('user').order_by('-created_at')[:10]
            data["recent_orders"] = [{
                "order_code": o.order_code,
                "customer": o.user.username,
                "value": float(o.total_price),
                "status": o.payment_status,
                "time": o.created_at.strftime("%d/%m/%Y %H:%M"),
            } for o in recent_orders]
        except Exception as e:
            logger.error(f"[Dashboard/live] recent_orders error: {e}")
            data["recent_orders"] = None

        cache.set(cache_key, data, timeout=30)  # 30 giây
        return Response({"success": True, "data": data, "from_cache": False})


class DashboardExportView(APIView):
    """
    Xuất báo cáo Dashboard ra Excel (.xlsx) hoặc PDF.
    Luôn đọc từ DB (không dùng cache) để đảm bảo số liệu chính xác.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        fmt = request.query_params.get('format', 'excel')
        start_date, end_date, start_dt, end_dt = _parse_date_range(request)

        total_revenue = (
            Order.objects.filter(created_at__range=(start_dt, end_dt), payment_status=Order.PaymentStatus.PAID)
            .aggregate(Sum('total_price'))['total_price__sum'] or 0
        )
        total_orders = Order.objects.filter(created_at__range=(start_dt, end_dt)).count()
        new_users = User.objects.filter(created_at__range=(start_dt, end_dt)).count()

        period_label = f"{start_date.strftime('%d/%m/%Y')} - {end_date.strftime('%d/%m/%Y')}"

        if fmt == 'excel':
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "BaoCao"
            ws.column_dimensions['A'].width = 30
            ws.column_dimensions['B'].width = 20

            ws.append(["BÁO CÁO TỔNG QUAN HỆ THỐNG"])
            ws.append([f"Thời gian: {period_label}"])
            ws.append([])
            ws.append(["Chỉ số", "Giá trị"])
            ws.append(["Tổng doanh thu (VND)", float(total_revenue)])
            ws.append(["Tổng đơn hàng", total_orders])
            ws.append(["Người dùng mới", new_users])

            output = io.BytesIO()
            wb.save(output)
            output.seek(0)
            response = HttpResponse(
                output,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="dashboard_report.xlsx"'
            return response

        elif fmt == 'pdf':
            output = io.BytesIO()
            p = canvas.Canvas(output, pagesize=A4)
            p.setFont("Helvetica-Bold", 14)
            p.drawString(72, 800, "BAO CAO TONG QUAN HE THONG")
            p.setFont("Helvetica", 11)
            p.drawString(72, 778, f"Thoi gian: {period_label}")
            p.line(72, 768, 520, 768)
            p.drawString(72, 750, f"Tong doanh thu: {float(total_revenue):,.0f} VND")
            p.drawString(72, 732, f"Tong don hang:  {total_orders}")
            p.drawString(72, 714, f"Nguoi dung moi: {new_users}")
            p.showPage()
            p.save()
            output.seek(0)
            response = HttpResponse(output, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="dashboard_report.pdf"'
            return response

        return Response({"error": "Invalid format. Use 'excel' or 'pdf'."}, status=400)
