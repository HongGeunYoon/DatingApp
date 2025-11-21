from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import UserProfile, Like 

# 유저 모델을 동적으로 가져와 CustomUser 변수에 할당합니다.
CustomUser = get_user_model() 

# 1. UserProfile Serializer: 프로필 필드들을 모두 Optional로 설정
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile 
        fields = ('nickname', 'age', 'gender', 'bio', 'interests', 'profile_picture') 
        
    # 명시적으로 required=False 및 allow_null/allow_blank 설정 (회원가입 1단계 통과를 위함)
    nickname = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    bio = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    interests = serializers.CharField(required=False, allow_null=True, allow_blank=True)


# 2. UserRegistrationSerializer: User 생성 및 Profile 연결 처리
class UserRegistrationSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False) 
    # 🚨 수정: required=False를 명시적으로 추가하여 파일이 없어도 통과하도록 함
    profile_picture = serializers.ImageField(write_only=True, required=False) 
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser # 동적으로 가져온 유저 모델 사용
        fields = ('username', 'email', 'password', 'profile_picture', 'profile') 
        read_only_fields = ('profile',)

    def create(self, validated_data):
        # 'profile_picture'가 필수가 아니므로, validated_data에 없을 수 있습니다.
        # .pop() 호출 시 default=None을 사용하여 키가 없을 때 KeyError를 방지합니다.
        validated_data.pop('profile', None) 
        profile_picture = validated_data.pop('profile_picture', None)
        
        with transaction.atomic():
            user = CustomUser.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            
            profile_defaults = {}
            if profile_picture:
                profile_defaults['profile_picture'] = profile_picture
            
            # UserProfile이 자동으로 생성되었는지 확인 후 업데이트/생성
            if hasattr(user, 'profile'):
                 # 이미 시그널 등으로 profile 객체가 생성되어 있다면 업데이트
                 for key, value in profile_defaults.items():
                    setattr(user.profile, key, value)
                 user.profile.save()
            else:
                # profile 객체가 없다면 새로 생성
                UserProfile.objects.create(user=user, **profile_defaults)
            
        return user

# 3. LikeSerializer: 좋아요 기능을 위한 Serializer 정의
class LikeSerializer(serializers.ModelSerializer):
    # 좋아요를 받는 사용자(ID)만 필드로 받습니다.
    liked_user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    
    class Meta:
        model = Like
        fields = ('id', 'liked_user', 'created_at')
        read_only_fields = ('user', 'created_at') # 'user'는 request.user로 자동 설정

    def create(self, validated_data):
        # context에서 요청한 사용자를 가져옵니다.
        user = self.context['request'].user
        liked_user = validated_data['liked_user']
        
        # 자기 자신에게 좋아요를 누르는 것을 방지
        if user == liked_user:
            raise serializers.ValidationError({"detail": "사용자 본인을 좋아할 수 없습니다."})

        # 이미 좋아요를 눌렀는지 확인하여 중복 방지
        if Like.objects.filter(user=user, liked_user=liked_user).exists():
            raise serializers.ValidationError({"detail": "이미 좋아요를 눌렀습니다."})
            
        # Like 객체를 생성합니다.
        return Like.objects.create(user=user, liked_user=liked_user)