class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
        from django.contrib.auth import get_user_model
        from asgiref.sync import sync_to_async

        User = get_user_model()
        headers = dict(scope["headers"])

        # Initialize scope user as AnonymousUser by default
        scope["user"] = AnonymousUser()

        if b"sec-websocket-protocol" in headers:
            try:
                token_name, token_key = (
                    headers[b"sec-websocket-protocol"].decode().split(", ")
                )
                AccessToken(token_key)
                user = await sync_to_async(User.objects.get)(id=token_name)
                scope["user"] = user
            except (TokenError, InvalidToken, User.DoesNotExist) as e:
                print(f"Authentication error: {e}")
                await send({"type": "websocket.close", "code": 4001})
                return

        # Proceed to call the inner application with the modified scope
        return await self.inner(scope, receive, send)
