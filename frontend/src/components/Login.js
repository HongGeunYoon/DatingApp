// frontend/src/components/Login.js (Material-UI 적용)

import React, { useState } from 'react';
import axios from 'axios';
// 🔑 1. Material-UI 컴포넌트들을 가져옵니다.
import { Container, Card, CardContent, Typography, TextField, Button, Alert, Box, Link } from '@mui/material';

// 🔑 onRegisterClick 프롭을 받아 회원가입 화면으로 전환할 수 있도록 합니다.
function Login({ onLoginSuccess, onRegisterClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // 에러 메시지 상태

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // 로그인 시도 전 에러 메시지 초기화

    try {
      const url = 'http://127.0.0.1:8000/api/token/';
      const { data } = await axios.post(url, { username, password });
      onLoginSuccess(data.access); // 로그인 성공 시 토큰 전달
    } catch (error) {
      setError("로그인 실패: ID 또는 비밀번호를 확인해주세요.");
      console.error("Login failed:", error);
    }
  };

  return (
    // 🔑 2. 화면 중앙 정렬을 위해 Container와 Box를 사용합니다.
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 🔑 3. Card와 CardContent로 로그인 폼 영역을 감쌉니다. */}
        <Card sx={{ width: '100%', padding: 2 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              로그인
            </Typography>

            {/* 에러 메시지가 있을 경우 Alert 컴포넌트로 표시합니다. */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* 🔑 4. Form 대신 Box를 사용하고, 각 입력 필드는 TextField로 만듭니다. */}
            <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="사용자 ID"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="비밀번호"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {/* 🔑 5. 'contained' variant를 가진 Button으로 로그인 버튼을 만듭니다. */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                로그인
              </Button>
              
              {/* 🔑 6. 회원가입 링크를 클릭 가능한 Link 컴포넌트로 만듭니다. */}
              <Box textAlign="center">
                <Link href="#" variant="body2" onClick={(e) => { e.preventDefault(); onRegisterClick(); }}>
                  계정이 없으신가요? 회원가입
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;