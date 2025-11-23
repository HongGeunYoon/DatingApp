from django.shortcuts import render
from django.contrib.auth.models import User 
from .models import UserProfile, Like

from rest_framework import viewsets, permissions, status, serializers 
from rest_framework.decorators import action
from rest_framework.response import Response

# 📌 수정: 필요한 시리얼라이저를 모두 임포트합니다.
from .serializers import UserProfileSerializer, LikeSerializer, UserRegistrationSerializer 
from .permissions import IsOwnerOrReadOnly 


# UserProfile ViewSet: 프로필 생성 및 조회 처리
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    # 기본 권한: 로그인된 사용자만 접근 가능
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly] 

    def perform_create(self, serializer):
        # 이미 프로필을 가지고 있는지 확인
        if UserProfile.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError({"detail": "이미 프로필을 가지고 있습니다. 프로필은 하나만 생성할 수 있습니다."})

        # 현재 로그인된 사용자를 user 필드에 저장
        serializer.save(user=self.request.user)

    # 🔑 1. 로그인 상태 확인 및 프로필 존재 여부 확인용 엔드포인트 (GET /api/users/userprofile/me/)
    @action(detail=False, methods=['get'])
    def me(self, request):
        """현재 로그인된 사용자의 프로필을 반환하거나, 없으면 404를 반환합니다."""
        if not request.user.is_authenticated:
            return Response({"detail": "인증 정보가 없습니다."}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            # 단일 객체를 가져와서, 프로필이 있으면 200 OK와 데이터 반환
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # 프로필이 없으면 404 Not Found 반환
            return Response({"detail": "프로필이 아직 생성되지 않았습니다."}, status=status.HTTP_404_NOT_FOUND)

    # 🔑 2. 매칭 대상 목록 조회용 엔드포인트 (GET /api/users/userprofile/matches/)
    @action(detail=False, methods=['get'])
    def matches(self, request):
        """현재 로그인된 사용자를 제외한 모든 프로필 목록을 반환합니다. (최소 필터링 버전)"""
        
        # 1. 모든 프로필을 가져옵니다.
        profiles = self.queryset.all()
        
        # 2. 현재 로그인된 사용자(나)의 프로필만 제외합니다.
        profiles = profiles.exclude(user=request.user) 
        
        # 3. 목록을 직렬화하여 반환합니다.
        serializer = self.get_serializer(profiles, many=True)
        return Response(serializer.data)

    # 🔑 3. 좋아요 통계 엔드포인트 (GET /api/users/userprofile/stats/)
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """사용자의 좋아요/받은 좋아요 통계를 제공합니다."""
        user = request.user
        
        # 1. 내가 좋아요를 보낸 사람 목록 (LikesSent)
        sent_likes = Like.objects.filter(liker=user)
        # 좋아요 받은 사람(like.liked)의 UserProfile을 찾습니다.
        likes_sent_profiles = [like.liked.userprofile for like in sent_likes if hasattr(like.liked, 'userprofile')]
        likes_sent_data = UserProfileSerializer(likes_sent_profiles, many=True).data

        # 2. 나에게 좋아요를 보낸 사람 목록 (LikesReceived)
        # 나(user)를 liked로 필터링합니다.
        received_likes = Like.objects.filter(liked=user)
        # 좋아요 보낸 사람(like.liker)의 UserProfile을 찾습니다.
        likes_received_profiles = [like.liker.userprofile for like in received_likes if hasattr(like.liker, 'userprofile')]
        
        likes_received_data = UserProfileSerializer(likes_received_profiles, many=True).data

        return Response({
            'likes_sent': likes_sent_data,       # 내가 좋아요를 누른 사람
            'likes_received': likes_received_data # 나에게 좋아요를 누른 사람 (잠재적 매칭)
        })


# Like ViewSet: 좋아요 생성 및 매칭 확인 처리
class LikeViewSet(viewsets.GenericViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated] 

    # 📌 1. 받은 좋아요 목록을 조회하는 커스텀 액션 추가 (GET /api/users/like/received_likes/)
    @action(detail=False, methods=['get'])
    def received_likes(self, request):
        # 현재 로그인된 사용자를 liked(좋아요 받은 사람)로 하는 Like 객체들을 필터링
        received_likes = self.get_queryset().filter(liked=request.user)
        
        # 받은 좋아요 리스트를 시리얼라이즈합니다.
        serializer = self.get_serializer(received_likes, many=True)
        return Response(serializer.data)


    # POST /api/users/like/ (좋아요 생성 및 매칭 확인)
    def create(self, request):
        
        # 1. 시리얼라이저를 사용하여 유효성 검사 및 데이터 추출
        # 이 시점에서 클라이언트 요청은 {'liked_user_id': 123} 형태여야 합니다.
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # 시리얼라이저의 validate 함수에서 이미 'liker'와 'liked' User 객체가 추가됨
        liker = serializer.validated_data['liker']
        liked_user = serializer.validated_data['liked']
        
        # 2. 좋아요 객체 생성 및 저장 (LikeSerializer의 create 메서드 실행)
        # create 메서드에서 중복 확인 및 매칭 로직(ChatRoom 생성)을 처리합니다.
        like = serializer.save(liker=liker, liked=liked_user) 
        
        # 3. 매칭 여부 최종 확인
        # 상대방(liked_user)이 나(liker)에게 좋아요를 보냈는지 확인
        is_matched = Like.objects.filter(liker=liked_user, liked=liker).exists()

        if is_matched:
            # 매칭 성공 시, 매칭되었다는 응답 반환
            return Response({
                'detail': "🎉 매칭 성공! 축하합니다!", 
                'is_matched': True,
                'liked_user_id': liked_user.id
            }, status=status.HTTP_201_CREATED)
        
        # 매칭 실패 시, 일반 좋아요 성공 응답 반환
        return Response({
            'detail': "좋아요 성공!", 
            'is_matched': False,
            'liked_user_id': liked_user.id
        }, status=status.HTTP_201_CREATED)

# 📌 추가: User Registration ViewSet: 회원가입 처리
class RegistrationViewSet(viewsets.GenericViewSet):
    serializer_class = UserRegistrationSerializer 
    # 회원가입은 로그인하지 않은 사용자도 가능해야 합니다.
    permission_classes = [permissions.AllowAny] 
    
    # POST 요청을 처리하여 사용자 생성 (POST /api/users/register/)
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        return Response({
            "user_id": user.id,
            "username": user.username,
            "message": "회원가입이 성공적으로 완료되었습니다."
        }, status=status.HTTP_201_CREATED)