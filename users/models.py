from django.db import models
from django.contrib.auth.models import User
from PIL import Image
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    # User 모델과 1:1 관계 설정 (User 삭제 시 Profile도 삭제됨)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    nickname = models.CharField(max_length=30, blank=True, null=True, verbose_name="닉네임")
    age = models.IntegerField(null=True, blank=True, verbose_name="나이")
    gender = models.CharField(max_length=10, choices=[('male', '남성'), ('female', '여성'), ('other', '기타')], blank=True, verbose_name="성별")
    bio = models.TextField(max_length=500, blank=True, verbose_name="자기소개")
    interests = models.CharField(max_length=255, blank=True, verbose_name="관심사")
    
    
    # 💡 프로필 사진을 위한 ImageField
    # 이전 에러 문제 해결을 위해 max_length를 500으로 늘립니다.
    profile_picture = models.ImageField(
        default='profile_pics/default.jpg',
        upload_to='profile_pics', 
        max_length=500,  # 파일 이름 길이 문제 해결 (이전 단계에서 언급)
        verbose_name='프로필 사진'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="업데이트일")
    
    def __str__(self):
        # user 객체가 존재하지 않을 수 있으므로, .user 접근 전에 확인하는 것이 안전합니다.
        return f'{getattr(self.user, "username", "No User")} Profile'

# ----------------- 3. Signal: User 생성 시 UserProfile 자동 생성 (제거) -----------------
# 🚨 이 시그널을 제거했습니다.
# 시리얼라이저의 create() 메서드에서 직접 UserProfile을 생성하고 데이터를 채우므로,
# 이 시그널은 UNIQUE constraint failed 에러를 유발합니다.
# @receiver(post_save, sender=User)
# def create_user_profile(sender, instance, created, **kwargs):
#     """새로운 User가 생성될 때 UserProfile도 함께 자동으로 생성합니다."""
#     if created:
#         UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """User가 저장될 때 연결된 UserProfile도 저장합니다."""
    # UserProfile 객체가 이미 존재한다고 가정하고 저장 시도
    try:
        instance.userprofile.save()
    except UserProfile.DoesNotExist:
        # 이 시그널은 UserProfile이 이미 생성된 후 (시리얼라이저에 의해) 호출되는 것이 이상적입니다.
        # UserProfile이 없으면 단순히 무시합니다. (예: 최초 생성 직후)
        pass

class Like(models.Model):
    # 좋아요를 누른 사람 (나)
    liker = models.ForeignKey(User, related_name='given_likes', on_delete=models.CASCADE, verbose_name="좋아요를 준 사용자")
    # 좋아요를 받은 사람 (상대방)
    receiver = models.ForeignKey(User, related_name='received_likes', on_delete=models.CASCADE, verbose_name="좋아요를 받은 사용자")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="좋아요 시간")

    class Meta:
        # 두 사용자 간에는 오직 하나의 좋아요만 존재하도록 제약 조건을 설정합니다.
        unique_together = ('liker', 'receiver')
        verbose_name = "좋아요"
        verbose_name_plural = "좋아요 목록"

    def __str__(self):
        return f"{self.liker.username} likes {self.receiver.username}"