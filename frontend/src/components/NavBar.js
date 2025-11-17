// frontend/src/components/NavBar.js (Material-UI 적용)

import React from 'react';
// 🔑 1. Material-UI의 AppBar, Toolbar, Typography, Button, Box, IconButton 컴포넌트를 가져옵니다.
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
// 🔑 2. 아이콘을 사용하기 위해 @mui/icons-material에서 아이콘을 가져옵니다.
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatIcon from '@mui/icons-material/Chat';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';

function NavBar({ onNavigate, onLogout, currentView }) {
    const isAuthenticated = localStorage.getItem('accessToken');

    if (!isAuthenticated) {
        return null; // 로그인 전에는 NavBar를 표시하지 않습니다.
    }

    return (
        // 🔑 3. AppBar를 사용하여 상단 내비게이션 바를 만듭니다. 'sticky' position으로 상단에 고정합니다.
        <AppBar position="sticky" color="default" elevation={1}>
            <Toolbar>
                {/* 🔑 4. 앱 로고와 이름을 Typography로 표시하고 클릭 시 메인 화면으로 이동합니다. */}
                <IconButton 
                    edge="start" 
                    color="inherit" 
                    aria-label="menu" 
                    sx={{ mr: 1 }}
                    onClick={() => onNavigate('match_list')}
                >
                    <FavoriteIcon color="error" />
                </IconButton>
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => onNavigate('match_list')}
                >
                    DatingApp
                </Typography>

                {/* 🔑 5. Box 컴포넌트를 사용해 내비게이션 버튼들을 그룹화합니다. */}
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {/* 
                      각 버튼은 현재 뷰(currentView)와 이름이 일치할 때 'contained' variant로 활성화 상태를 표시합니다.
                      startIcon으로 각 버튼에 아이콘을 추가하여 시각적 효과를 높입니다.
                    */}
                    <Button 
                        color="inherit" 
                        variant={currentView === 'match_list' ? 'contained' : 'text'}
                        onClick={() => onNavigate('match_list')}
                        startIcon={<FavoriteIcon />}
                    >
                        매칭
                    </Button>
                    <Button 
                        color="inherit" 
                        variant={currentView === 'chat_list' || currentView === 'chat' ? 'contained' : 'text'}
                        onClick={() => onNavigate('chat_list')}
                        startIcon={<ChatIcon />}
                    >
                        채팅
                    </Button>
                    <Button 
                        color="inherit" 
                        variant={currentView === 'stats' ? 'contained' : 'text'}
                        onClick={() => onNavigate('stats')}
                        startIcon={<BarChartIcon />}
                    >
                        통계
                    </Button>
                </Box>
                
                {/* 🔑 6. 로그아웃 버튼을 만들고 아이콘을 추가합니다. */}
                <Button color="error" variant="outlined" onClick={onLogout} startIcon={<LogoutIcon />} sx={{ ml: 2 }}>
                    로그아웃
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;