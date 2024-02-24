"""
ASGI config for project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter
from channels.security.websocket import AllowedHostsOriginValidator
from .middleware import TokenAuthMiddleware


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")
django.setup()

from project import routing  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(
            TokenAuthMiddleware(routing.URLRouter(routing.websocket_urlpatterns))
        ),
    }
)
