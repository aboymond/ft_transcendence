from prometheus_client import Counter, Histogram
from metrics.metrics import page_views_counter
import time

REQUEST_COUNT = Counter(
    'django_request_count', 'Nombre total de requêtes', ['method', 'endpoint', 'http_status']
)
REQUEST_LATENCY = Histogram('django_request_latency_seconds', 'Latence des requêtes', ['endpoint'])

class PrometheusMonitoringMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        response = self.get_response(request)

        REQUEST_COUNT.labels(method=request.method, endpoint=request.path, http_status=response.status_code).inc()
        REQUEST_LATENCY.labels(endpoint=request.path).observe(time.time() - start_time)

        return response

class PageViewMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Code exécuté pour chaque requête avant que la vue soit appelée

        response = self.get_response(request)

        # Code exécuté après que la vue soit appelée

        # Incrémente le compteur de vues de pages
        page_views_counter.labels(method=request.method, view=request.path).inc()

        return response