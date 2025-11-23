import React, { useCallback } from 'react';
import axios from 'axios';
import { Card, CardMedia, CardContent, CardActions, Typography, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';

function MatchCard({ profile, onLikeSuccess, onMatchSuccess }) {
    const token = localStorage.getItem('accessToken');
    
    // 💡 1. Hooks는 항상 컴포넌트 최상단에, 조건 없이 호출되어야 합니다.
    // profile 객체를 의존성 배열에 포함하여, profile이 업데이트될 때마다 이 함수가 재생성되도록 합니다.
    const handleLike = useCallback(async (action) => {
        if (!token) {
            console.error('로그인이 필요합니다.');
            return;
        }

        try {
            // profile.user 접근은 이 콜백 내부에서 이루어지므로, 
            // 렌더링 시점에 profile이 유효하다면 안전합니다.
            const response = await axios.post(
                'http://127.0.0.1:8000/api/users/like/', 
                { receiver: profile.user, action },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            onLikeSuccess(profile.user); 
            
            if (response.data.is_match) {
                onMatchSuccess(response.data.room_name);
            }

        } catch (error) {
            console.error("좋아요/싫어요 처리 실패:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || '요청 처리 중 서버 오류가 발생했습니다.';
            
            if (errorMessage.includes("이미") || errorMessage.includes("자신에게")) {
                onLikeSuccess(profile.user);
            } else {
                console.error(`처리 실패: ${errorMessage}`);
            }
        }
    }, [token, profile, onLikeSuccess, onMatchSuccess]);

    // 💡 2. Hooks 호출 후에 조건부 렌더링(early return)을 수행합니다.
    // 이렇게 하면 profile이 undefined일 때도 위쪽의 useCallback은 호출됩니다.
    if (!profile) {
        console.warn("MatchCard: profile 데이터가 아직 로드되지 않았거나 유효하지 않습니다.");
        return null;
    }

    // 3. profile 객체가 유효한 경우에만 아래 로직을 실행합니다.
    const picturePath = profile.profile_picture;
    const finalImageUrl = picturePath 
        ? picturePath
        : "https://via.placeholder.com/345x300?text=No+Image";

    console.log('--- MatchCard 디버깅 정보 ---');
    console.log('1. 프로필 객체:', profile);
    console.log('2. profile_picture 값:', picturePath);
    console.log('3. 최종 이미지 URL:', finalImageUrl);
    console.log('------------------------------');
    
    const getGenderEmoji = (gender) => (gender === 'M' ? '👨' : '👩');

    return (
        <Card sx={{ width: 345, m: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardMedia
                component="img"
                height="300" 
                image={finalImageUrl}
                alt={`${profile.nickname}의 프로필 이미지`}
                sx={{ objectFit: 'cover' }}
            />
            
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

            <CardActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
                <Tooltip title="Pass">
                    <IconButton 
                        aria-label="pass" 
                        onClick={() => handleLike('pass')} 
                        sx={{ color: 'red', border: '1px solid red', margin: '0 20px' }}
                    >
                        <CloseIcon fontSize="large" />
                    </IconButton>
                </Tooltip>
                
                <Tooltip title="Like">
                    <IconButton 
                        aria-label="like" 
                        onClick={() => handleLike('like')} 
                        sx={{ color: 'green', border: '1px solid green', margin: '0 20px' }}
                    >
                        <FavoriteIcon fontSize="large" />
                    </IconButton>
                </Tooltip>
            </CardActions>
        </Card>
    );
}

export default MatchCard;