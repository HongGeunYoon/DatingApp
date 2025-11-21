from django.contrib import admin
from django.utils.html import format_html
# CustomUser 모델을 함께 가져옵니다. (이전 단계에서 정의한 사용자 모델)
from .models import CustomUser, UserProfile, Like 
from django.contrib.auth.admin import UserAdmin 


# 1. CustomUser 모델 등록 (기본 UserAdmin 사용)
# CustomUser 모델이 기본 사용자 모델로 사용되고 있다면, admin에 등록해줘야 합니다.
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    pass
    

# 2. UserProfile 모델 등록 (썸네일 기능 포함)
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    # 'profile_picture' 필드가 아닌 'profile_thumbnail' 커스텀 메소드를 사용합니다.
    list_display = ('user', 'nickname', 'age', 'gender', 'profile_thumbnail') 
    
    search_fields = ('nickname', 'user__username')
    list_filter = ('gender',)
    
    # ⭐️ 커스텀 메소드: 프로필 사진 썸네일과 경로를 표시합니다.
    def profile_thumbnail(self, obj):
        # obj.profile_picture가 None이 아닐 때만 처리
        if obj.profile_picture and obj.profile_picture.name:
            # 파일 이름(경로)과 썸네일을 함께 표시합니다.
            return format_html(
                # 경로 텍스트 표시
                '<a href="{url}" target="_blank" style="display: block; margin-bottom: 5px; color: #106fcc;">{path}</a>'
                # 썸네일 이미지 표시
                '<img src="{url}" style="max-width: 60px; height: auto; border-radius: 4px; border: 1px solid #eee;" />',
                url=obj.profile_picture.url,
                path=obj.profile_picture.name
            )
        return format_html('<span style="color: #999;">- 사진 없음 -</span>')

    profile_thumbnail.short_description = '프로필 사진' # 목록 컬럼 이름
    

# 3. Like 모델 등록 (필드 이름 수정)
@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    # ⭐️ 핵심 수정: 'receiver' 대신 모델 필드 이름인 'liked'를 사용합니다.
    list_display = ('liker', 'liked', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('liker__username', 'liked__username')

    # 읽기 전용 필드 추가 (필요한 경우)
    readonly_fields = ('created_at',)