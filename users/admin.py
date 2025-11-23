from django.contrib import admin
from django.contrib.auth.models import User
from .models import UserProfile, Like

# 1. UserProfile을 User 모델 상세 페이지에 인라인으로 표시하기 위한 클래스
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    # 관리자 페이지에서 UserProfile의 필드들을 지정합니다.
    fields = ('nickname', 'age', 'gender', 'bio', 'interest', 'profile_image') 

# 2. 기본 User 모델의 관리자 페이지를 오버라이드 (프로필 인라인 포함)
class CustomUserAdmin(admin.ModelAdmin):
    # User 모델의 기본 필드들을 정의합니다.
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    inlines = (UserProfileInline,) # User 상세 페이지에 Profile 필드가 표시됩니다.

# --- 모델 등록 시작 ---

# A. User 모델 등록: 기존 등록 해제 후 CustomAdmin으로 다시 등록
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    # 이미 등록되어 있지 않은 경우 무시합니다.
    pass
admin.site.register(User, CustomUserAdmin)


# B. UserProfile 모델 등록: Admin 메뉴에 별도 항목으로 표시합니다. (★ 이 코드가 누락되었었습니다!)
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    # 목록 페이지에 표시할 필드
    list_display = ('user', 'nickname', 'age', 'gender', 'created_at')
    # 필터링 및 검색 기능 추가
    list_filter = ('gender', 'created_at')
    search_fields = ('user__username', 'nickname', 'bio', 'interest')
    # ForeignKey 필드인 'user'는 ID로 빠르게 검색하도록 설정
    raw_id_fields = ('user',) 


# C. Like 모델 등록
@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    # 목록 페이지에 표시할 필드
    list_display = ('liker', 'receiver', 'created_at')
    # 필터링 및 검색 기능 추가
    list_filter = ('created_at',)
    search_fields = ('liker__username', 'receiver__username')
    # ForeignKey 필드인 'liker', 'receiver'는 ID로 빠르게 검색하도록 설정
    raw_id_fields = ('liker', 'receiver')