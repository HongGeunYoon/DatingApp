import React, { useState } from 'react';
import axios from 'axios';
import { 
    Container, Card, CardContent, Typography, TextField, Button, Alert, Box, Link, Grid,
    CircularProgress // 로딩 인디케이터
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

/**
 * 회원가입 1단계: 사용자 기본 계정 정보 및 프로필 사진 등록
 * 성공 시 onRegisterSuccess를 호출하여 다음 단계(ProfileForm)로 넘어갑니다.
 */
function Register({ onRegisterSuccess, onBackToLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    
    const [profilePicture, setProfilePicture] = useState(null); 
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file || null);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    // DRF 에러 응답을 사용자 친화적인 문자열로 변환하는 헬퍼 함수
    const formatError = (errorData) => {
        const fieldNames = {
            username: '사용자 ID', email: '이메일', password: '비밀번호', 
            profile_pic: '프로필 사진', // 필드명 일치
            nickname: '닉네임', age: '나이', gender: '성별',
            non_field_errors: '전체 오류'
        };
        
        const errorMessages = Object.entries(errorData)
            .map(([key, value]) => {
                const fieldName = fieldNames[key] || key;
                return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
            })
            .join(' | ');

        return errorMessages;
    };


    const handleSubmit = async (event) => {
        event.preventDefault(); // ⬅️ 여기서 'event'로 수정하여 오류 해결
        setMessage('');
        setError('');
        setLoading(true);

        // 클라이언트 측 필수 필드 검증
        if (!formData.username || !formData.email || !formData.password) {
            setError('ID, 이메일, 비밀번호는 필수 항목입니다.');
            setLoading(false);
            return;
        }

        if (!profilePicture) {
            setError('프로필 사진은 필수 항목입니다.');
            setLoading(false);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        
        // 🚨 백엔드 UserProfile 모델의 필드명 'profile_pic'으로 전송
        data.append('profile_pic', profilePicture); 

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/users/register/', data);
            
            setMessage(`🎉 ${response.data.username}님, 계정 생성이 완료되었습니다! 다음 단계로 이동합니다.`);
            
            // 3초 후 다음 단계(ProfileForm)로 이동
            setTimeout(() => {
                if (onRegisterSuccess) {
                    onRegisterSuccess();
                }
            }, 3000);

        } catch (err) {
            console.error("회원가입 실패:", err.response?.data || err.message);
            const errorData = err.response?.data;
            if (errorData) {
                // 백엔드 에러 메시지: "닉네임: 이 필드는 필수입니다." 등이 표시될 것입니다.
                setError(formatError(errorData));
            } else {
                setError("서버와 통신할 수 없습니다. 네트워크를 확인하세요.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Card sx={{ width: '100%', padding: 3, borderRadius: 2, boxShadow: 6 }}>
                    <CardContent>
                        <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                            회원가입 (1/2 단계)
                        </Typography>
                        
                        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                {/* 사용자 ID, 이메일, 비밀번호 */}
                                <Grid item xs={12}><TextField required fullWidth margin="none" id="username" label="사용자 ID" name="username" value={formData.username} onChange={handleChange} autoFocus /></Grid>
                                <Grid item xs={12}><TextField required fullWidth margin="none" id="email" label="이메일 주소" name="email" type="email" value={formData.email} onChange={handleChange} /></Grid>
                                <Grid item xs={12}><TextField required fullWidth margin="none" name="password" label="비밀번호" type="password" id="password" value={formData.password} onChange={handleChange} /></Grid>

                                {/* 프로필 사진 업로드 및 미리보기 */}
                                <Grid item xs={12}>
                                    <Box sx={{ border: '1px solid #ccc', p: 1.5, borderRadius: 1, textAlign: 'center', mt: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            프로필 사진 (필수)
                                        </Typography>
                                        {imagePreview && (
                                            <Box 
                                                component="img" 
                                                src={imagePreview} 
                                                sx={{ 
                                                    width: 100, height: 100, 
                                                    borderRadius: '50%', 
                                                    objectFit: 'cover', 
                                                    mt: 1, mb: 1.5, 
                                                    border: '2px solid #3f51b5'
                                                }}
                                            />
                                        )}
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="profile-picture-upload"
                                            type="file"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="profile-picture-upload">
                                            <Button 
                                                variant="outlined" 
                                                component="span" 
                                                startIcon={<PhotoCameraIcon />}
                                                color={profilePicture ? "success" : "primary"}
                                                sx={{ mt: 1 }}
                                            >
                                                {profilePicture ? profilePicture.name : '사진 선택'}
                                            </Button>
                                        </label>
                                    </Box>
                                </Grid>

                                {/* 가입하기 버튼 */}
                                <Grid item xs={12}>
                                    <Button
                                        type="submit" fullWidth
                                        variant="contained" color="secondary"
                                        disabled={loading}
                                        sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : '계정 생성 (1단계 완료)'}
                                    </Button>
                                </Grid>
                            </Grid>

                            {/* 로그인 페이지로 돌아가는 링크 */}
                            <Box textAlign="center" sx={{ mt: 2 }}>
                                <Link 
                                    component="button" 
                                    variant="body2" 
                                    onClick={(e) => { e.preventDefault(); onBackToLogin(); }}
                                >
                                    이미 계정이 있으신가요? 로그인
                                </Link>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}

export default Register;