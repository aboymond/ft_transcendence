from channels.middleware import BaseMiddleware
from django.conf import settings
from channels.db import database_sync_to_async


@database_sync_to_async
def get_user(user_id):
    from django.contrib.auth import get_user_model

    User = get_user_model()

    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


def validate_token(token):
    from rest_framework_simplejwt.backends import TokenBackend
    from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

    try:
        token_backend = TokenBackend(
            algorithm=settings.SIMPLE_JWT["ALGORITHM"],
            signing_key=settings.SIMPLE_JWT["SIGNING_KEY"],
        )
        decoded_token = token_backend.decode(token)
        user = get_user(decoded_token["user_id"])
        return user
    except (InvalidToken, TokenError):
        return None


class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        token = dict(
            (x.split("=") for x in scope["query_string"].decode().split("&"))
        ).get("token", None)
        if token:
            user = await validate_token(token)
            if user is not None:
                scope["user"] = user
                return await super().__call__(scope, receive, send)
        return await send({"type": "websocket.close"})
