// frontend/src/components/MatchCard.js (Material-UI 적용)

import React, { useCallback } from 'react';
import axios from 'axios';
// 🔑 1. Material-UI의 카드 관련 컴포넌트와 아이콘 버튼을 가져옵니다.
import { Card, CardMedia, CardContent, CardActions, Typography, IconButton, Box, Tooltip } from '@mui/material';
// 🔑 2. "Pass"와 "Like"에 사용할 아이콘을 가져옵니다.
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';

function MatchCard({ profile, onLikeSuccess, onMatchSuccess }) {
    const token = localStorage.getItem('accessToken');
    
    const handleLike = useCallback(async (action) => {
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/users/like/', 
                { receiver: profile.user, action },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            onLikeSuccess(profile.user); 
            
            if (response.data.is_match) {
                alert(`${profile.nickname}님과 매칭되었습니다! 🎉 채팅을 시작하세요!`);
                onMatchSuccess(response.data.room_name);
            } else if (action === 'like') {
                // '좋아요'를 보냈다는 알림은 잠시 보류 (UI/UX 개선)
            }

        } catch (error) {
            console.error("좋아요/싫어요 처리 실패:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || '요청 처리 중 서버 오류가 발생했습니다.';
            
            if (errorMessage.includes("이미") || errorMessage.includes("자신에게")) {
                onLikeSuccess(profile.user); // 불필요한 카드는 화면에서 제거
            } else {
                alert(`처리 실패: ${errorMessage}`);
            }
        }
    }, [token, profile, onLikeSuccess, onMatchSuccess]);
    
    const getGenderEmoji = (gender) => (gender === 'M' ? '👨' : '👩');

    return (
        // 🔑 3. Card 컴포넌트를 사용하여 전체 카드의 스타일(너비, 그림자 등)을 정의합니다.
        <Card sx={{ width: 345, m: 2, boxShadow: 3, borderRadius: 2 }}>
            {/* 🔑 4. CardMedia를 사용하여 이미지를 표시합니다. 이미지가 영역에 꽉 차도록 설정합니다. */}
            <CardMedia
                component="img"
                height="300" // 이미지 높이를 고정합니다.
                image={
                    profile.profile_picture 
                    // 🔑 Django 서버에서 제공하는 미디어 파일 URL을 올바르게 조합합니다.
                    ? `http://127.0.0.1:8000${profile.profile_picture}` 
                    : "https://via.placeholder.com/345x300?text=No+Image"
                }
                alt={`${profile.nickname}의 프로필 이미지`}
                // 🔑 5. 이미지가 잘리지 않고 비율을 유지하며 채워지도록 'objectFit'을 설정합니다.
                sx={{ objectFit: 'cover' }}
            />
            
            {/* 🔑 6. CardContent를 사용하여 프로필 텍스트 정보를 배치합니다. */}
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {profile.nickname} {getGenderEmoji(profile.gender)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {profile.age}세, {profile.location}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    {profile.bio || '자기소개가 없습니다.'}
                </Typography>
            </CardContent>

            {/* 🔑 7. CardActions를 사용하여 버튼들을 하단에 배치하고 중앙 정렬합니다. */}
            <CardActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
                {/* 🔑 8. "Pass" 버튼을 빨간색 아이콘 버튼으로 만듭니다. Tooltip으로 부가 설명을 제공합니다. */}
                <Tooltip title="Pass">
                    <IconButton 
                        aria-label="pass" 
                        onClick={() => handleLike('pass')} 
                        sx={{ 
                            color: 'red', 
                            border: '1px solid red', 
                            margin: '0 20px' 
                        }}
                    >
                        <CloseIcon fontSize="large" />
                    </IconButton>
                </Tooltip>
                
                {/* 🔑 9. "Like" 버튼을 초록색 아이콘 버튼으로 만듭니다. */}
                <Tooltip title="Like">
                    <IconButton 
                        aria-label="like" 
                        onClick={() => handleLike('like')} 
                        sx={{ 
                            color: 'green', 
                            border: '1px solid green', 
                            margin: '0 20px' 
                        }}
                    >
                        <FavoriteIcon fontSize="large" />
                    </IconButton>
                </Tooltip>
            </CardActions>
        </Card>
    );
}

export default MatchCard;