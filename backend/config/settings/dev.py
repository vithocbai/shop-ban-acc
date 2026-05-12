from .base import *

# Cài đặt dành riêng cho môi trường Development
DEBUG = True

ALLOWED_HOSTS = ['*']

# Thêm debug toolbar hoặc các công cụ dev khác nếu cần
# INSTALLED_APPS += ['debug_toolbar']
# MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']

# Email backend cho dev (in ra console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
