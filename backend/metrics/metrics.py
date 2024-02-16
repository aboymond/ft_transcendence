from prometheus_client import Counter

page_views_counter = Counter('django_page_views_total', 'Nombre total de vues de page', ['method', 'view'])