import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Container, CircularProgress, Box, List, ListItem, ListItemText, Divider, Typography, Alert } from '@mui/material';
import { AccessAlarm, ThreeDRotation } from '@mui/icons-material'; // 예시 아이콘

// 🚨 주의: 이 컴포넌트들은 실제 파일에서 import 되어야 합니다.
// import ProfileForm from './components/ProfileForm';
// import MatchCard from './components/MatchCard';
// import Login from './components/Login'; 
// import Register from './components/Register';
// import ChatRoom from './components/ChatRoom'; 
// import NavBar from './components/NavBar';
// import Stats from './pages/Stats';

// =======================================================
// 📌 더미 컴포넌트 정의 (실제 컴포넌트가 없으므로 임시로 정의)
// 실제 프로젝트에서는 이 부분을 제거하고 import를 사용하세요.
const ProfileForm = ({ onProfileCreated }) => <Box sx={{ p: 4, textAlign: 'center' }}><Alert severity="warning">ProfileForm 컴포넌트 자리</Alert><button onClick={onProfileCreated}>프로필 생성 완료 (Dummy)</button></Box>;
const MatchCard = ({ profile, onLikeSuccess, onMatchSuccess }) => <Box sx={{ p: 2, border: '1px solid #ddd', m: 1 }}><Typography>{profile.nickname}</Typography><button onClick={() => onLikeSuccess(profile.user)}>좋아요</button></Box>;
const Login = ({ onLoginSuccess, onRegisterClick }) => <Box sx={{ p: 4, textAlign: 'center' }}><Alert severity="info">로그인 폼</Alert><button onClick={() => onLoginSuccess("DUMMY.JWT.TOKEN")}>로그인 (Dummy)</button><button onClick={onRegisterClick}>회원가입</button></Box>;
const Register = ({ onRegisterSuccess, onBackToLogin }) => <Box sx={{ p: 4, textAlign: 'center' }}><Alert severity="info">회원가입 폼</Alert><button onClick={onRegisterSuccess}>회원가입 완료</button><button onClick={onBackToLogin}>로그인으로 돌아가기</button></Box>;
const ChatRoom = ({ roomName, onClose }) => <Box sx={{ p: 4, textAlign: 'center', height: '60vh' }}><Alert severity="success">채팅방: {roomName}</Alert><button onClick={onClose}>채팅 목록으로</button></Box>;
const NavBar = ({ onNavigate, onLogout, currentView }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 2, borderBottom: '1px solid #ccc' }}>
        <button onClick={() => onNavigate('match_list')} disabled={currentView === 'match_list'}>매칭</button>
        <button onClick={() => onNavigate('chat_list')} disabled={currentView === 'chat_list'}>채팅</button>
        <button onClick={() => onNavigate('stats')} disabled={currentView === 'stats'}>통계</button>
        <button onClick={onLogout}>로그아웃</button>
    </Box>
);
const Stats = () => <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="h5">통계 페이지 (Stats)</Typography></Box>;
// =======================================================


function App() {
    // 💡 1. API 주소를 변수로 중앙 관리합니다. (나중에 process.env로 교체 가능)
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [isProfileSet, setIsProfileSet] = useState(false); 
    const [matchProfiles, setMatchProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentView, setCurrentView] = useState('login'); 
    const [activeRoomName, setActiveRoomName] = useState(null); 
    const [chatRooms, setChatRooms] = useState([]);

    // 💡 2. 사용자 ID를 상태로 관리하여 JWT 파싱을 최소화합니다.
    const [currentUserId, setCurrentUserId] = useState(null);

    // 💡 JWT 토큰에서 사용자 ID를 안전하게 파싱하는 함수를 useMemo로 메모이제이션
    const decodeUserIdFromToken = useCallback((token) => {
        try {
            return token ? JSON.parse(atob(token.split('.')[1])).user_id : null;
        } catch (e) {
            console.error("JWT 파싱 실패 또는 토큰 형식 오류:", e);
            return null;
        }
    }, []);


    const handleLogout = useCallback(() => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        setIsProfileSet(false);
        setCurrentUserId(null); // ID 상태 초기화
        setMatchProfiles([]);
        setChatRooms([]);
        setActiveRoomName(null);
        setCurrentView('login'); 
    }, []);

    const checkProfileExistence = useCallback(async (token) => {
        try {
            // 💡 API_BASE_URL 사용
            const response = await axios.get(
                `${API_BASE_URL}/users/userprofile/me/`, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setIsProfileSet(response.status === 200);
            return response.status === 200;
        } catch (error) {
            if (error.response?.status === 404) {
                setIsProfileSet(false); return false;
            } else if (error.response?.status === 401) {
                handleLogout();
            }
            console.error("프로필 확인 중 오류 발생:", error);
            setIsProfileSet(false); return false;
        }
    }, [handleLogout]);

    const fetchMatches = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return; 

        setLoading(true);
        try {
            // 💡 API_BASE_URL 사용
            const response = await axios.get(
                `${API_BASE_URL}/users/userprofile/matches/`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setMatchProfiles(response.data);
        } catch (error) {
            console.error("매칭 목록 불러오기 실패:", error);
            if (error.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    }, [handleLogout, API_BASE_URL]);

    const fetchChatRooms = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setLoading(true);
        try {
            // 💡 API_BASE_URL 사용
            const response = await axios.get(
                `${API_BASE_URL}/chat/rooms/`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setChatRooms(response.data);
            setCurrentView('chat_list'); 
        } catch (error) {
            console.error("채팅방 목록 불러오기 실패:", error);
            if (error.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    }, [handleLogout, API_BASE_URL]);

    // 초기 인증 및 프로필 상태 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken'); 
        if (token) {
            const userId = decodeUserIdFromToken(token); // ID 디코딩
            setCurrentUserId(userId);

            setIsLoggedIn(true);
            checkProfileExistence(token).then((profileExists) => {
                if (!profileExists) {
                    setCurrentView('profile_form');
                } else {
                    setCurrentView('match_list'); 
                }
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
            setCurrentView('login');
        }
    }, [checkProfileExistence, decodeUserIdFromToken]); 
    // 🚨 decodeUserIdFromToken를 의존성 배열에 추가해야 합니다.

    // 뷰 전환 시 데이터 페칭
    useEffect(() => {
        if (isLoggedIn && isProfileSet) {
            if (currentView === 'match_list') fetchMatches();
            else if (currentView === 'chat_list') fetchChatRooms();
        }
    }, [isLoggedIn, isProfileSet, fetchMatches, fetchChatRooms, currentView]);

    const navigateTo = useCallback((viewName) => {
        setCurrentView(viewName);
        // 데이터 페칭은 useEffect에서 처리되므로 여기서는 상태만 변경
    }, []);

    const handleLoginSuccess = useCallback(async (token) => {
        localStorage.setItem('accessToken', token);
        const userId = decodeUserIdFromToken(token); // ID 디코딩
        setCurrentUserId(userId); // ID 상태 저장

        setIsLoggedIn(true);
        const profileExists = await checkProfileExistence(token);
        setCurrentView(profileExists ? 'match_list' : 'profile_form');
    }, [checkProfileExistence, decodeUserIdFromToken]);

    const handleProfileCreated = useCallback(() => {
        setIsProfileSet(true);
        navigateTo('match_list'); 
    }, [navigateTo]);
    
    const handleLikeSuccess = useCallback((likedUserId) => {
        setMatchProfiles(prev => prev.filter(p => p.user !== likedUserId));
    }, []);

    const handleMatchSuccess = useCallback((roomName) => {
        setActiveRoomName(roomName);
        setCurrentView('chat');
    }, []);

    // ----------------------------------------------
    // 💡 3. 렌더링 로직 함수 분리 (가독성 향상)
    // ----------------------------------------------

    const renderChatListView = () => (
        <Box sx={{ maxWidth: '800px', margin: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center">내 채팅 목록 💬</Typography>
            {loading ? <CircularProgress /> : (
                <List>
                    {chatRooms.length > 0 ? (
                        chatRooms.map((room, index) => {
                            // 💡 currentUserId 상태 사용
                            const targetNickname = room.user1.toString() === currentUserId.toString() ? room.user2_nickname : room.user1_nickname;
                            return (
                                <React.Fragment key={room.id}>
                                    <ListItem button onClick={() => handleMatchSuccess(room.name)}>
                                        <ListItemText 
                                            primary={`${targetNickname}님과의 대화`}
                                            secondary={`생성일: ${new Date(room.created_at).toLocaleDateString()}`} 
                                        />
                                    </ListItem>
                                    {index < chatRooms.length - 1 && <Divider />}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <Typography align="center" sx={{ mt: 4 }}>아직 생성된 채팅방이 없습니다.</Typography>
                    )}
                </List>
            )}
        </Box>
    );

    const renderMatchListView = () => (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h4" gutterBottom>오늘의 매칭 대상 ✨</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 2 }}>
                {matchProfiles.length > 0 ? (
                    matchProfiles.map(profile => (
                        <MatchCard 
                            key={profile.user} 
                            profile={profile} 
                            onLikeSuccess={handleLikeSuccess} 
                            onMatchSuccess={handleMatchSuccess}
                        />
                    ))
                ) : (
                    <Typography sx={{ mt: 4 }}>주변에 매칭 가능한 프로필이 없습니다. 잠시 후 다시 시도해 보세요.</Typography>
                )}
            </Box>
        </Box>
    );

    // ----------------------------------------------
    // 최종 렌더링
    // ----------------------------------------------

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }
    
    // 비로그인 상태 (Login/Register)
    if (!isLoggedIn) {
        return currentView === 'register' 
            ? <Register onRegisterSuccess={() => setCurrentView('login')} onBackToLogin={() => setCurrentView('login')} />
            : <Login onLoginSuccess={handleLoginSuccess} onRegisterClick={() => setCurrentView('register')} />;
    }
    
    // 로그인했으나 프로필 미설정 상태
    if (!isProfileSet || currentView === 'profile_form') {
        return <ProfileForm onProfileCreated={handleProfileCreated} />;
    }
    
    // 로그인 및 프로필 설정 완료 후 메인 콘텐츠
    let mainContent;

    switch (currentView) {
        case 'chat':
            mainContent = activeRoomName 
                ? <ChatRoom roomName={activeRoomName} onClose={() => navigateTo('chat_list')} />
                : <Alert severity="error">채팅방 정보를 불러올 수 없습니다.</Alert>;
            break;
        case 'chat_list':
            mainContent = renderChatListView();
            break;
        case 'stats':
            mainContent = <Stats />;
            break;
        case 'match_list':
        default: 
            mainContent = renderMatchListView();
            break;
    }

    return (
        <React.Fragment>
            <NavBar onNavigate={navigateTo} onLogout={handleLogout} currentView={currentView} />
            <Container component="main" sx={{ mt: 4, mb: 4 }}>
                {mainContent}
            </Container>
        </React.Fragment>
    );
}

export default App;