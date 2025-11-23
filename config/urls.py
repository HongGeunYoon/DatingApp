"""
URL configuration for config project.
...
"""
from django.contrib import admin
from django.urls import path, include

# 🔑 [필수] 이미지 서빙을 위한 임포트
from django.conf import settings
from django.conf.urls.static import static

from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# 📌 1. ViewSet 임포트: users 앱과 chat 앱에서 필요한 ViewSet들을 임포트합니다.
from users.views import UserProfileViewSet, LikeViewSet, RegistrationViewSet
from chat.views import ChatRoomViewSet 

# 📌 2. 라우터 설정: API 그룹별로 라우터를 분리합니다.

# A. Users 관련 엔드포인트 라우터 (접두어: api/users/)
users_router = routers.DefaultRouter()
users_router.register(r'userprofile', UserProfileViewSet)
users_router.register(r'like', LikeViewSet, basename='like')
users_router.register(r'register', RegistrationViewSet, basename='register')

# B. Chat 관련 엔드포인트 라우터 (접두어: api/)
chat_router = routers.DefaultRouter()
# chat_router에 등록된 경로는 'chat/rooms'이므로, 최상위 경로는 'api/chat/rooms/'가 됩니다.
chat_router.register(r'chat/rooms', ChatRoomViewSet, basename='chatroom') 


urlpatterns = [
    path('admin/', admin.site.urls),
        
    # 📌 3. Users 라우터 등록: '/api/users/' 아래에 userprofile, like, register를 포함합니다.
    # 🌟 이 수정으로 프론트엔드 요청 경로 (/api/users/userprofile/)와 일치하게 됩니다.
    path('api/users/', include(users_router.urls)),
        
    # 📌 4. Chat 라우터 등록: '/api/' 아래에 chat/rooms를 포함합니다.
    path('api/', include(chat_router.urls)),
        
    # 🚨 [JWT 인증 엔드포인트]
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# 🔑 [핵심 추가] 개발 환경에서 MEDIA 파일을 서빙하도록 설정합니다. (urlpatterns의 마지막)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)