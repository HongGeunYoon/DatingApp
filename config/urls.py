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

# 📌 2. 라우터 설정
router = routers.DefaultRouter()
# 🚨 수정: 'users/' 접두사를 제거하여 '/api/userprofile/'로 접근 가능하게 합니다.
router.register(r'userprofile', UserProfileViewSet)
# 🚨 수정: 'users/' 접두사를 제거하여 '/api/like/'로 접근 가능하게 합니다.
router.register(r'like', LikeViewSet, basename='like')
# 🚨 핵심 수정: 'users/' 접두사를 제거하여 '/api/register/'로 접근 가능하게 합니다.
router.register(r'register', RegistrationViewSet, basename='register')
# 'chat'은 API 내에서 그룹화하는 것이 적절하므로 유지
router.register(r'chat/rooms', ChatRoomViewSet, basename='chatroom') 


urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 📌 3. 라우터에 등록된 모든 ViewSet 경로를 'api/' 아래에 포함
    path('api/', include(router.urls)),
    
    # 🚨 [JWT 인증 엔드포인트]
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# 🔑 [핵심 추가] 개발 환경에서 MEDIA 파일을 서빙하도록 설정합니다. (urlpatterns의 마지막)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)