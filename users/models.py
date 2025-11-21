from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission # Group, Permission 추가
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

# CustomUser 모델 정의 (기본 장고 사용자 모델 확장)
class CustomUser(AbstractUser):
    # M2M 필드의 Reverse Accessor 충돌을 해결하기 위해 related_name을 명시적으로 지정합니다.
    # 이 부분은 AbstractUser를 상속받을 때 발생하는 일반적인 충돌을 방지합니다.
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="custom_user_groups", # 충돌 해결
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_permissions", # 충돌 해결
        related_query_name="user",
    )
    
    # 필요한 추가 필드를 여기에 정의할 수 있습니다.
    pass

# 성별 선택을 위한 상수
GENDER_CHOICES = [
    ('M', 'Male'),
    ('F', 'Female'),
    ('O', 'Other'),
]

# UserProfile 모델 정의 (사용자의 추가 정보 저장)
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    
    nickname = models.CharField(max_length=50, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True) 
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    interests = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

# 좋아요(Like) 모델 정의
class Like(models.Model):
    # 좋아요를 누른 사람
    liker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_likes')
    
    # 좋아요를 받은 사람
    liked = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_likes')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # 한 사용자가 다른 사용자를 두 번 이상 좋아요 할 수 없도록 제약 조건 추가
        unique_together = ('liker', 'liked')
        verbose_name = 'Like'
        verbose_name_plural = 'Likes'

    def __str__(self):
        return f"{self.liker.username} likes {self.liked.username}"


# CustomUser 생성/저장 시 UserProfile을 자동 생성하는 시그널
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)