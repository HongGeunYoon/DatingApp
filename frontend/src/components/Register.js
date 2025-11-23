import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

// onLoginAfterRegister: 회원가입 성공 후 자동으로 로그인 처리 및 화면 전환을 위한 콜백
// onBackToLogin: '로그인으로 돌아가기' 버튼 클릭 시 화면 전환을 위한 콜백
function Register({ onLoginAfterRegister, onBackToLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        // 🔑 UserProfile 필드 추가
        nickname: '',
        age: '',
        gender: 'male', // 기본값
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // 🚨 나이와 성별은 백엔드에서 필요하므로 반드시 확인합니다.
        if (!formData.age || !formData.gender) {
            setError("나이와 성별을 모두 입력해주세요.");
            setLoading(false);
            return;
        }

        try {
            const url = 'http://127.0.0.1:8000/api/users/register/';
            
            // 🔑 UserProfile 데이터를 포함하여 전송
            const dataToSend = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password2: formData.password2,
                nickname: formData.nickname,
                // age는 숫자 타입이어야 합니다.
                age: parseInt(formData.age), 
                gender: formData.gender,
            };

            const response = await axios.post(url, dataToSend);

            if (response.status === 201) {
                // 회원가입 성공 후 바로 로그인 처리 (선택 사항: 토큰 요청)
                alert("회원가입에 성공했습니다! 로그인 화면으로 돌아갑니다.");
                onBackToLogin(); 
                
                // 만약 바로 자동 로그인을 원한다면, 아래 로직을 사용합니다.
                /*
                // 토큰 요청 엔드포인트가 필요합니다. (API 구조에 따라 다름)
                const loginUrl = 'http://127.0.0.1:8000/api/token/';
                const loginResponse = await axios.post(loginUrl, { 
                    username: formData.username, 
                    password: formData.password 
                });
                onLoginAfterRegister(loginResponse.data.access);
                */
            }
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
            const errorMsg = error.response?.data 
                ? Object.values(error.response.data).flat().join(' ')
                : '회원가입 중 알 수 없는 오류가 발생했습니다.';
            setError(`회원가입 실패: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '22rem', padding: '20px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">회원가입</h2>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleRegister}>
                        {/* 사용자 ID */}
                        <Form.Group className="mb-3" controlId="regUsername">
                            <Form.Label>사용자 ID</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="username"
                                value={formData.username} 
                                onChange={handleChange} 
                                placeholder="사용자 ID" 
                                required 
                            />
                        </Form.Group>
                        
                        {/* 이메일 */}
                        <Form.Group className="mb-3" controlId="regEmail">
                            <Form.Label>이메일</Form.Label>
                            <Form.Control 
                                type="email" 
                                name="email"
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="이메일" 
                                required 
                            />
                        </Form.Group>

                        {/* 비밀번호 */}
                        <Form.Group className="mb-3" controlId="regPassword">
                            <Form.Label>비밀번호</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="password"
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder="비밀번호" 
                                required 
                            />
                        </Form.Group>
                        
                        {/* 비밀번호 확인 */}
                        <Form.Group className="mb-3" controlId="regPassword2">
                            <Form.Label>비밀번호 확인</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="password2"
                                value={formData.password2} 
                                onChange={handleChange} 
                                placeholder="비밀번호 확인" 
                                required 
                            />
                        </Form.Group>
                        
                        {/* 닉네임 (UserProfile) */}
                        <Form.Group className="mb-3" controlId="regNickname">
                            <Form.Label>닉네임</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="nickname"
                                value={formData.nickname} 
                                onChange={handleChange} 
                                placeholder="닉네임" 
                            />
                        </Form.Group>
                        
                        {/* 나이 (UserProfile) */}
                        <Form.Group className="mb-3" controlId="regAge">
                            <Form.Label>나이 (필수)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="age"
                                value={formData.age} 
                                onChange={handleChange} 
                                placeholder="나이" 
                                min="18"
                                required 
                            />
                        </Form.Group>
                        
                        {/* 성별 (UserProfile) */}
                        <Form.Group className="mb-4" controlId="regGender">
                            <Form.Label>성별 (필수)</Form.Label>
                            <Form.Control
                                as="select"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="male">남성</option>
                                <option value="female">여성</option>
                                <option value="other">기타</option>
                            </Form.Control>
                        </Form.Group>

                        <Button variant="success" type="submit" className="w-100 mb-3" disabled={loading}>
                            {loading ? '등록 중...' : '회원가입'}
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        이미 계정이 있으신가요? 
                        <Button 
                            variant="link" 
                            onClick={onBackToLogin}
                            className="p-0 ms-1 fw-bold text-decoration-underline"
                        >
                            로그인
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Register;