// App.js (Material-UI 적용 및 전체 리팩토링)

// 🔑 1. Bootstrap CSS import를 제거합니다. MUI는 자체 스타일링 시스템을 사용합니다.
// import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 🔑 2. MUI 컴포넌트 및 아이콘을 가져옵니다.
import { Container, CircularProgress, Box, List, ListItem, ListItemText, Divider, Typography } from '@mui/material';

// 🔑 3. 컴포넌트들을 가져옵니다. (이 컴포넌트들도 MUI를 사용하도록 수정되었습니다)
import ProfileForm from './components/ProfileForm';
import MatchCard from './components/MatchCard';
import Login from './components/Login'; 
import Register from './components/Register';
import ChatRoom from './components/ChatRoom'; 
import NavBar from './components/NavBar';
import Stats from './pages/Stats';


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [isProfileSet, setIsProfileSet] = useState(false); 
    const [matchProfiles, setMatchProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentView, setCurrentView] = useState('login'); // 🔑 초기 뷰를 'login'으로 설정
    const [activeRoomName, setActiveRoomName] = useState(null); 
    const [chatRooms, setChatRooms] = useState([]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        setIsProfileSet(false);
        setMatchProfiles([]);
        setChatRooms([]);
        setCurrentView('login'); 
    }, []);

    const checkProfileExistence = useCallback(async (token) => {
        try {
            const response = await axios.get(
                'http://127.0.0.1:8000/api/users/userprofile/me/', 
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
            const response = await axios.get(
                'http://127.0.0.1:8000/api/users/userprofile/matches/',
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setMatchProfiles(response.data);
        } catch (error) {
            console.error("매칭 목록 불러오기 실패:", error);
            if (error.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    const fetchChatRooms = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setLoading(true);
        try {
            const response = await axios.get(
                'http://127.0.0.1:8000/api/chat/rooms/',
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
    }, [handleLogout]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken'); 
        if (token) {
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
    }, [checkProfileExistence]); 

    useEffect(() => {
        if (isLoggedIn && isProfileSet) {
            if (currentView === 'match_list') fetchMatches();
            else if (currentView === 'chat_list') fetchChatRooms();
        }
    }, [isLoggedIn, isProfileSet, fetchMatches, fetchChatRooms, currentView]);

    const navigateTo = useCallback((viewName) => {
        setCurrentView(viewName);
        if (viewName === 'match_list') fetchMatches(); 
        else if (viewName === 'chat_list') fetchChatRooms(); 
    }, [fetchMatches, fetchChatRooms]);

    const handleLoginSuccess = useCallback(async (token) => {
        localStorage.setItem('accessToken', token);
        setIsLoggedIn(true);
        const profileExists = await checkProfileExistence(token);
        setCurrentView(profileExists ? 'match_list' : 'profile_form');
    }, [checkProfileExistence]);

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

    const getCurrentUserId = () => {
        try {
            const token = localStorage.getItem('accessToken');
            return token ? JSON.parse(atob(token.split('.')[1])).user_id : null;
        } catch (e) {
            console.error("JWT 파싱 실패:", e);
            return null;
        }
    };

    // --- 렌더링 로직 ---
    if (loading) {
        // 🔑 4. 로딩 인디케이터를 MUI의 CircularProgress로 변경합니다.
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }
    
    // 🔑 5. 로그인/회원가입 뷰를 렌더링합니다. NavBar가 없습니다.
    if (currentView === 'login' || currentView === 'register' || !isLoggedIn) {
        return currentView === 'register' 
            ? <Register onRegisterSuccess={() => setCurrentView('login')} onBackToLogin={() => setCurrentView('login')} />
            : <Login onLoginSuccess={handleLoginSuccess} onRegisterClick={() => setCurrentView('register')} />;
    }
    
    if (currentView === 'profile_form' || (isLoggedIn && !isProfileSet)) {
        return <ProfileForm onProfileCreated={handleProfileCreated} />;
    }
    
    // 🔑 6. 로그인 후 보여줄 메인 콘텐츠를 결정합니다.
    let mainContent;
    
    if (currentView === 'chat' && activeRoomName) {
        mainContent = <ChatRoom roomName={activeRoomName} onClose={() => navigateTo('chat_list')} />;
    } else if (currentView === 'chat_list') {
        const currentUserId = getCurrentUserId();
        // 🔑 7. 채팅 목록을 MUI의 List와 ListItem으로 재구성하여 깔끔하게 보여줍니다.
        mainContent = (
            <Box sx={{ maxWidth: '800px', margin: 'auto', mt: 4 }}>
                <Typography variant="h4" gutterBottom align="center">내 채팅 목록 💬</Typography>
                {loading ? <CircularProgress /> : (
                    <List>
                        {chatRooms.length > 0 ? (
                            chatRooms.map((room, index) => {
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
    } else if (currentView === 'stats') {
        mainContent = <Stats />;
    } else { 
        // 🔑 8. 매칭 목록 뷰를 구성합니다.
        mainContent = (
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
                        <Typography sx={{ mt: 4 }}>주변에 매칭 가능한 프로필이 없습니다.</Typography>
                    )}
                </Box>
            </Box>
        );
    }

    // 🔑 9. 최종적으로 NavBar와 메인 콘텐츠를 함께 렌더링합니다.
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