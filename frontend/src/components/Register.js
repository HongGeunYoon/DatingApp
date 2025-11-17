// frontend/src/components/Register.js (Material-UI 적용)

import React, { useState } from 'react';
import axios from 'axios';
// 🔑 1. Material-UI 컴포넌트들을 가져옵니다.
import { Container, Card, CardContent, Typography, TextField, Button, Alert, Box, Link } from '@mui/material';

// 🔑 onRegisterSuccess와 onBackToLogin 프롭을 받습니다.
function Register({ onRegisterSuccess, onBackToLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/users/register/', formData);
            setMessage(`🎉 ${response.data.username}님, 회원가입이 성공적으로 완료되었습니다! 잠시 후 로그인 페이지로 이동합니다.`);
            
            // 🔑 3초 후 자동으로 로그인 페이지로 이동
            setTimeout(() => {
                if (onRegisterSuccess) {
                    onRegisterSuccess();
                }
            }, 3000);

        } catch (err) {
            console.error("회원가입 실패:", err.response?.data || err.message);
            const errorData = err.response?.data;
            if (errorData) {
                const errorMessages = Object.values(errorData).flat().join(' ');
                setError(errorMessages || "회원가입 중 알 수 없는 오류가 발생했습니다.");
            } else {
                setError("서버와 통신할 수 없습니다. 네트워크를 확인하세요.");
            }
        }
    };

    return (
        // 🔑 2. 화면 중앙 정렬을 위해 Container와 Box를 사용합니다.
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Card sx={{ width: '100%', padding: 2 }}>
                    <CardContent>
                        <Typography component="h1" variant="h5" align="center" gutterBottom>
                            회원가입
                        </Typography>
                        
                        {/* 성공 또는 에러 메시지를 Alert로 표시합니다. */}
                        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        
                        {/* 🔑 3. 회원가입 폼을 Box와 TextField로 구성합니다. */}
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="사용자 ID"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="이메일 주소"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="비밀번호"
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {/* 🔑 4. 가입하기 버튼 스타일을 지정합니다. */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="secondary"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                가입하기
                            </Button>
                            
                            {/* 🔑 5. 로그인 페이지로 돌아가는 링크를 추가합니다. */}
                            <Box textAlign="center">
                                <Link href="#" variant="body2" onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>
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