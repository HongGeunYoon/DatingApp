from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework.exceptions import ValidationError 
from .models import UserProfile, Like
from chat.models import ChatRoom 

# ----------------- 1. UserProfile Serializer (조회용) -----------------
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    is_matched = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(read_only=True) 

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'nickname', 'age', 'gender', 'bio', 'interests', 'profile_picture', 'is_matched']

    def get_is_matched(self, obj):
        """현재 요청 사용자(liker)와 이 프로필의 주인(receiver)이 상호 좋아요 상태인지 확인합니다."""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.id != obj.user_id:
            # Note: Like 모델의 receiver 필드가 'liked'로 바뀌었을 경우를 가정하고 수정함
            i_liked = Like.objects.filter(liker=request.user, liked=obj.user).exists()
            they_liked_me = Like.objects.filter(liker=obj.user, liked=request.user).exists()
            return i_liked and they_liked_me
        return False
    
# ----------------- 1-B. UserProfile Create/Update Serializer (생성/수정 전용) -----------------
class UserProfileCreateUpdateSerializer(serializers.ModelSerializer):
    # 🚨 수정: 모든 필드에 required=False를 명시하여 PATCH 요청에 완벽하게 대응합니다.
    nickname = serializers.CharField(required=False, allow_blank=True, max_length=30)
    age = serializers.IntegerField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, max_length=10)
    bio = serializers.CharField(required=False, allow_blank=True, max_length=500)
    interests = serializers.CharField(required=False, allow_blank=True, max_length=255)
    profile_picture = serializers.ImageField(required=False)
    
    def validate_age(self, value):
        if value is not None and value < 0:
            raise ValidationError("나이는 0보다 작을 수 없습니다.")
        return value
        
    class Meta:
        model = UserProfile
        fields = ['nickname', 'age', 'gender', 'bio', 'interests', 'profile_picture']
        
# ----------------- 2. Like Serializer (좋아요 생성/조회 - 매칭 로직 포함) -----------------
class LikeSerializer(serializers.ModelSerializer):
    liker = serializers.ReadOnlyField(source='liker.id')
    # 🚨 수정: 필드 이름을 liked_user_id로 변경하고, 클라이언트가 이 필드(ID)를 보내도록 기대합니다.
    liked_user_id = serializers.IntegerField(write_only=True) 

    class Meta:
        model = Like
        # Note: 실제 모델 필드는 'liker'와 'liked'로 가정하고 fields를 수정합니다.
        fields = ['id', 'liker', 'liked_user_id', 'created_at'] 
        read_only_fields = ['created_at']

    def validate(self, data):
        liker = self.context['request'].user
        # 🚨 수정: 'liked_user_id'를 가져옵니다.
        liked_user_id = data.get('liked_user_id') 
        
        if not liked_user_id:
             raise serializers.ValidationError({"liked_user_id": "좋아요를 받을 사용자의 ID가 필요합니다."})
        
        try:
            # 🚨 수정: 좋아요를 받는 사용자 객체를 가져옵니다.
            liked_user = User.objects.get(id=liked_user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({"liked_user_id": "존재하지 않는 사용자 ID입니다."})

        if liker == liked_user:
            raise serializers.ValidationError("자기 자신에게 좋아요를 할 수 없습니다.")

        # 🚨 수정: 좋아요 중복 확인 (liker와 liked_user 객체를 사용)
        if Like.objects.filter(liker=liker, liked=liked_user).exists():
            raise serializers.ValidationError("이미 좋아요를 누르셨습니다.")

        # 🚨 추가: 뷰의 perform_create에서 사용될 수 있도록 User 객체를 data에 추가합니다.
        data['liked'] = liked_user 
        data['liker'] = liker 
        # 🚨 삭제: 더 이상 validated_data에 'liked_user_id'는 필요하지 않으므로 삭제
        del data['liked_user_id']
        return data
    
    def create(self, validated_data):
        # Note: Like 모델에 liker와 liked 필드가 있다고 가정하고 로직을 수정합니다.
        
        # 1. 좋아요 객체 생성
        like = Like.objects.create(
            liker=validated_data['liker'], 
            liked=validated_data['liked'] # 🚨 수정: receiver -> liked
        )
        
        liker = validated_data['liker']
        liked_user = validated_data['liked'] # 🚨 수정: receiver -> liked_user
        
        # 2. 매칭 확인: 상대방(liked_user)이 나(liker)에게 좋아요를 눌렀는지 확인
        is_match = Like.objects.filter(liker=liked_user, liked=liker).exists()
        
        if is_match:
            # 3. 매칭 성사! -> ChatRoom 생성 로직 실행 (안전하게 트랜잭션 내부에서 실행)
            with transaction.atomic():
                user_a, user_b = sorted([liker, liked_user], key=lambda u: u.id)
                
                # 중복 채팅방 생성 방지
                if not ChatRoom.objects.filter(user1=user_a, user2=user_b).exists():
                    ChatRoom.objects.create(
                        user1=user_a,
                        user2=user_b,
                        name=f'chat_{user_a.id}_{user_b.id}' 
                    )
                    print(f"매칭 성사! 새로운 채팅방이 생성되었습니다: chat_{user_a.id}_{user_b.id}")
                else:
                    print("채팅방이 이미 존재합니다.")
                    
        return like
    
# ----------------- 3. User Registration Serializer (회원가입 - 원자적 트랜잭션 적용) -----------------
class UserRegistrationSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}) 
    
    # UserProfile fields
    nickname = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    interests = serializers.CharField(required=False, allow_blank=True)
    profile_picture = serializers.ImageField(required=False)

    def validate(self, data):
        """비밀번호 확인 및 사용자 이름 중복 확인."""
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "두 비밀번호가 일치하지 않습니다."})
        
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "이미 존재하는 사용자 이름입니다."})
            
        return data

    @transaction.atomic # 👈 트랜잭션 데코레이터 유지
    def create(self, validated_data):
        """User 객체와 연결된 UserProfile 객체를 생성합니다."""
        
        # 1. User Fields 추출
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        validated_data.pop('password2') 
        
        # 2. UserProfile Fields 추출 (validated_data에 남은 모든 항목)
        profile_data = {
            'nickname': validated_data.pop('nickname', ''),
            'age': validated_data.pop('age', None),
            'gender': validated_data.pop('gender', ''),
            'bio': validated_data.pop('bio', ''),
            'interests': validated_data.pop('interests', ''),
            'profile_picture': validated_data.pop('profile_picture', None)
        }

        # 3. Django User 객체 생성
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        # 4. UserProfile 객체 생성 (트랜잭션으로 묶여 있으므로 실패 시 3번 롤백)
        UserProfile.objects.create(
            user=user, 
            **profile_data
        )

        return user