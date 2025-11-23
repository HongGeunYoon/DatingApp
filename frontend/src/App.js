import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // 오류 발생 라인 제거

// Bootstrap JS는 React 환경에서 직접 import 하는 대신,
// HTML 파일에 CDN 링크를 추가하거나, 필요한 기능(예: 탭)을 직접 구현하는 것이 일반적입니다.
// 이 코드는 Bootstrap CSS 클래스만 사용하며, 탭 전환은 React의 상태(useState)로 처리합니다.

// ====================================================================
// --- 유틸리티 컴포넌트 ---
// ====================================================================

// 상태 메시지 컴포넌트 (성공/실패 피드백)
const StatusMessage = ({ message, type }) => {
  if (!message) return null;
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
  return (
    // Bootstrap JS 없이도 CSS 효과만으로 fade show 클래스를 유지합니다.
    <div className={`alert ${alertClass} alert-dismissible fade show`} role="alert">
      {message}
      <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  );
};

// ====================================================================
// --- 1. 로그인 컴포넌트 ---
// ====================================================================
const LoginComponent = ({ navigateTo, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  
  const handleLogin = (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });
    setLoading(true);

    // TODO: 실제 로그인 API 호출 로직을 여기에 구현하세요.
    // 현재는 Mockup 로직입니다.
    setTimeout(() => {
        // Mockup: 로그인 성공 시
        const mockToken = 'mock_auth_token_12345';
        localStorage.setItem('accessToken', mockToken);
        
        setStatus({ message: "로그인 성공!", type: 'success' });
        // 부모 컴포넌트에 로그인 성공을 알리고 대시보드로 이동
        onLoginSuccess(); 

        setLoading(false);
    }, 1500);
  };

  return (
    <div className="card shadow-lg border-0 mx-auto" style={{ maxWidth: '400px' }}>
      <div className="card-body p-5">
        <h2 className="card-title text-center mb-4 text-primary fw-bold">로그인</h2>
        <StatusMessage message={status.message} type={status.type} />
        <form onSubmit={handleLogin}>
          <div className="form-floating mb-3">
            <input 
              type="text" 
              id="login-username"
              className="form-control" 
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="login-username">아이디</label>
          </div>
          <div className="form-floating mb-4">
            <input 
              type="password" 
              id="login-password"
              className="form-control" 
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="login-password">비밀번호</label>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100 mb-3 rounded-pill" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                로그인 중...
              </>
            ) : '로그인'}
          </button>
          <div className="text-center">
            <p className="mb-0 text-muted">
              계정이 없으신가요? 
              <button 
                type="button" 
                className="btn btn-link p-0 ms-1 text-decoration-none fw-bold" 
                onClick={() => navigateTo('signup')}
                disabled={loading}
              >
                회원가입
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====================================================================
// --- 2. 회원가입 컴포넌트 ---
// ====================================================================
const SignupComponent = ({ navigateTo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  
  const handleSignup = (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });
    setLoading(true);

    // TODO: 실제 회원가입 API 호출 로직을 여기에 구현하세요.
    // 현재는 Mockup 로직입니다.
    setTimeout(() => {
        setStatus({ message: "회원가입 성공! 이제 로그인하세요.", type: 'success' });
        setLoading(false);
        // 성공 시 로그인 페이지로 자동 전환
        setTimeout(() => navigateTo('login'), 1000); 
    }, 1500);
  };

  return (
    <div className="card shadow-lg border-0 mx-auto" style={{ maxWidth: '400px' }}>
      <div className="card-body p-5">
        <h2 className="card-title text-center mb-4 text-success fw-bold">회원가입</h2>
        <StatusMessage message={status.message} type={status.type} />
        <form onSubmit={handleSignup}>
          <div className="form-floating mb-3">
            <input 
              type="email" 
              id="signup-email"
              className="form-control" 
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="signup-email">이메일</label>
          </div>
          <div className="form-floating mb-4">
            <input 
              type="password" 
              id="signup-password"
              className="form-control" 
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="signup-password">비밀번호</label>
          </div>
          <button 
            type="submit" 
            className="btn btn-success btn-lg w-100 mb-3 rounded-pill" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                등록 중...
              </>
            ) : '회원가입'}
          </button>
          <div className="text-center">
            <p className="mb-0 text-muted">
              이미 계정이 있으신가요? 
              <button 
                type="button" 
                className="btn btn-link p-0 ms-1 text-decoration-none fw-bold" 
                onClick={() => navigateTo('login')}
                disabled={loading}
              >
                로그인
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====================================================================
// --- 3. ProfileForm 컴포넌트 (프로필 등록/수정) ---
// ====================================================================
function ProfileForm({ onProfileCreated, onLogout }) {
  const [formData, setFormData] = useState({
    nickname: '', age: '', gender: 'M', bio: '', interests: '', profile_picture: null,
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profile_picture' && files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });
    setLoading(true);

    const accessToken = localStorage.getItem('accessToken'); 
    
    if (!accessToken) {
      setStatus({ message: "인증 오류: 로그인 토큰이 없습니다. 다시 로그인해주세요.", type: 'error' });
      setLoading(false);
      onLogout();
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('nickname', formData.nickname);
    dataToSend.append('age', formData.age);
    dataToSend.append('gender', formData.gender);
    dataToSend.append('bio', formData.bio);
    dataToSend.append('interests', formData.interests);
    
    if (formData.profile_picture) {
      dataToSend.append('profile_picture', formData.profile_picture);
    }
    
    try {
      // TODO: 실제 백엔드 URL로 변경하세요.
      const url = 'http://127.0.0.1:8000/api/users/userprofile/';
      
      const response = await axios.post(url, dataToSend, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      
      setStatus({ 
        message: `${response.data.nickname}님의 프로필이 성공적으로 생성(업데이트)되었습니다!`, 
        type: 'success' 
      });
      onProfileCreated(response.data); 
      
      // 폼 초기화 (선택 사항)
      // setFormData({ nickname: '', age: '', gender: 'M', bio: '', interests: '', profile_picture: null });

    } catch (error) {
      console.error("프로필 생성 실패:", error.response?.data || error.message);
      
      const errorData = error.response?.data;
      let errorMessage = "프로필 생성 실패: 알 수 없는 오류가 발생했습니다.";

      if (error.response?.status === 401) {
        errorMessage = "인증 오류: 로그인 세션이 만료되었습니다. 다시 로그인해주세요.";
        onLogout();
      } else if (errorData && typeof errorData === 'object') {
        const firstErrorKey = Object.keys(errorData)[0];
        const detailMessage = Array.isArray(errorData[firstErrorKey]) 
                               ? errorData[firstErrorKey].join(' ') 
                               : errorData[firstErrorKey];
        errorMessage = `프로필 생성 실패 (${firstErrorKey}): ${detailMessage}`;
      }
      
      setStatus({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-lg border-0" style={{ maxWidth: '600px', width: '100%' }}>
      <div className="card-header bg-light">
        <h3 className="h5 mb-0 text-center">프로필 등록/수정</h3>
      </div>
      <div className="card-body p-4">
        
        <StatusMessage message={status.message} type={status.type} />

        <form onSubmit={handleSubmit}>
          
          {/* 닉네임 */}
          <div className="form-floating mb-3">
            <input name="nickname" id="nickname" type="text" placeholder="닉네임" className="form-control"
              value={formData.nickname} onChange={handleChange} required disabled={loading}
            />
             <label htmlFor="nickname">닉네임</label>
          </div>
          
          <div className="row g-3 mb-3">
            {/* 나이 */}
            <div className="col-md-6">
              <div className="form-floating">
                <input name="age" id="age" type="number" placeholder="나이" className="form-control"
                  value={formData.age} onChange={handleChange} required min="18" disabled={loading}
                />
                <label htmlFor="age">나이</label>
              </div>
            </div>
            {/* 성별 */}
            <div className="col-md-6">
              <div className="form-floating">
                <select name="gender" id="gender" className="form-select"
                  value={formData.gender} onChange={handleChange} disabled={loading}
                >
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
                <label htmlFor="gender">성별</label>
              </div>
            </div>
          </div>
          
          {/* 프로필 사진 */}
          <div className="mb-3">
            <label htmlFor="profile_picture" className="form-label text-muted">프로필 사진 (선택 사항)</label>
            <input name="profile_picture" id="profile_picture" type="file" accept="image/*"
              className="form-control" onChange={handleChange} disabled={loading}
            />
          </div>

          {/* 자기소개 */}
          <div className="mb-3">
            <label htmlFor="bio" className="form-label text-muted">자기소개</label>
            <textarea name="bio" id="bio" placeholder="자기소개" className="form-control"
              value={formData.bio} onChange={handleChange} rows="3" style={{ resize: 'none' }} disabled={loading}
            ></textarea>
          </div>
          
          {/* 관심사 */}
          <div className="form-floating mb-4">
            <input name="interests" id="interests" type="text" placeholder="관심사 (예: 독서,여행,코딩)" className="form-control"
              value={formData.interests} onChange={handleChange} disabled={loading}
            />
            <label htmlFor="interests">관심사 (쉼표로 구분)</label>
          </div>
          
          {/* 제출 버튼 */}
          <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                저장 중...
              </>
            ) : '프로필 정보 저장'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ====================================================================
// --- 4. 메인 대시보드 컴포넌트 (매칭, 채팅, 통계 탭 포함) ---
// ====================================================================

// 탭 콘텐츠 플레이스홀더
const PlaceholderContent = ({ title, description, color }) => (
    <div className={`card p-4 border-start border-5 border-${color} shadow-sm`}>
        <h4 className={`text-${color}`}>{title}</h4>
        <p className="lead">{description}</p>
        <p className="text-muted">여기에 실제 {title} 페이지의 로직과 UI를 구현해야 합니다.</p>
    </div>
);

const DashboardComponent = ({ onLogout }) => {
    // 탭 상태: 'matching', 'chat', 'stats', 'profile'
    const [subPage, setSubPage] = useState('matching'); 

    const handleProfileCreated = (profileData) => {
        console.log("프로필 생성/업데이트 완료:", profileData);
        // 프로필 업데이트 후 매칭 페이지로 이동하도록 설정
        setSubPage('matching');
    };
    
    // 현재 탭에 맞는 컴포넌트를 렌더링
    let content;
    switch (subPage) {
        case 'chat':
            content = <PlaceholderContent 
                        title="채팅" 
                        description="실시간 채팅 목록 및 대화창을 구현합니다." 
                        color="warning"
                      />;
            break;
        case 'stats':
            content = <PlaceholderContent 
                        title="통계/분석" 
                        description="사용자 활동 통계 및 매칭 성공률 분석 정보를 제공합니다." 
                        color="info"
                      />;
            break;
        case 'profile':
            content = <ProfileForm onProfileCreated={handleProfileCreated} onLogout={onLogout} />;
            break;
        case 'matching':
        default:
            content = <PlaceholderContent 
                        title="매칭" 
                        description="프로필을 기반으로 사용자에게 새로운 상대를 추천하는 로직을 구현합니다." 
                        color="success"
                      />;
            break;
    }

    // 탭 버튼 스타일
    const getTabClass = (page) => 
        `nav-link ${subPage === page ? 'active bg-primary text-white' : 'text-primary'}`;

    return (
        <div className="w-100 p-3 p-md-5">
            <div className="card shadow-lg border-0">
                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h2 className="h4 mb-0 text-dark">메인 대시보드</h2>
                    <button className="btn btn-sm btn-outline-danger" onClick={onLogout}>
                        <i className="bi bi-box-arrow-right me-1"></i> 로그아웃
                    </button>
                </div>
                
                {/* 탭 네비게이션 */}
                <div className="card-body p-0">
                    <ul className="nav nav-tabs nav-fill bg-light p-2" role="tablist">
                        <li className="nav-item">
                            <button className={getTabClass('matching')} onClick={() => setSubPage('matching')}>
                                <i className="bi bi-heart-fill me-2"></i> 매칭
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={getTabClass('chat')} onClick={() => setSubPage('chat')}>
                                <i className="bi bi-chat-dots-fill me-2"></i> 채팅
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={getTabClass('stats')} onClick={() => setSubPage('stats')}>
                                <i className="bi bi-bar-chart-fill me-2"></i> 통계
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={getTabClass('profile')} onClick={() => setSubPage('profile')}>
                                <i className="bi bi-person-circle me-2"></i> 프로필
                            </button>
                        </li>
                    </ul>

                    {/* 탭 콘텐츠 */}
                    <div className="tab-content p-4">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ====================================================================
// --- Main App Component (라우팅 역할) ---
// ====================================================================
const App = () => {
  // 'login', 'signup', 'dashboard' 중 하나를 가집니다.
  const [page, setPage] = useState('login'); 
  const [isAuthReady, setIsAuthReady] = useState(false);

  // 컴포넌트 로드 시 로그인 토큰 확인
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setPage('dashboard');
    }
    setIsAuthReady(true);
  }, []);

  const handleNavigation = (targetPage) => {
    setPage(targetPage);
  };

  const handleLoginSuccess = () => {
    setPage('dashboard'); // 로그인 성공 시 대시보드로 이동
  };
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // 토큰 제거
    setPage('login'); // 로그아웃 후 로그인 페이지로 이동
  };

  if (!isAuthReady) {
    return (
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }


  // 현재 페이지에 따라 적절한 컴포넌트를 렌더링합니다.
  let content;
  switch (page) {
    case 'signup':
      content = <SignupComponent navigateTo={handleNavigation} />;
      break;
    case 'dashboard':
      // 토큰이 없으면 로그인 페이지로 강제 이동
      if (!localStorage.getItem('accessToken')) {
        content = <LoginComponent navigateTo={handleNavigation} onLoginSuccess={handleLoginSuccess} />;
      } else {
        content = <DashboardComponent onLogout={handleLogout} />;
      }
      break;
    case 'login':
    default:
      content = <LoginComponent navigateTo={handleNavigation} onLoginSuccess={handleLoginSuccess} />;
      break;
  }

  return (
    // Tailwind CSS의 flex 및 min-h-screen 대신 Bootstrap 클래스 사용
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f8f9fa' }}>
      <header className="bg-white shadow-sm py-3 mb-5">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="h4 mb-0 text-primary fw-bold">Dating App Skeleton</h1>
          <nav>
            <button 
              className={`btn btn-sm ${page === 'login' ? 'btn-primary' : 'btn-outline-primary'} me-2`} 
              onClick={() => handleNavigation('login')}
            >
              로그인
            </button>
            <button 
              className={`btn btn-sm ${page === 'signup' ? 'btn-success' : 'btn-outline-success'} me-2`} 
              onClick={() => handleNavigation('signup')}
            >
              회원가입
            </button>
            {page === 'dashboard' && (
                <button 
                    className={`btn btn-sm btn-dark`} 
                    onClick={() => handleNavigation('dashboard')}
                >
                  대시보드
                </button>
            )}
          </nav>
        </div>
      </header>
      
      <main className="container flex-grow-1 d-flex justify-content-center align-items-center py-5">
        {content}
      </main>

      <footer className="py-3 mt-auto border-top text-center text-muted">
        <small>&copy; 2024 Complete App Structure. Bootstrap 5</small>
      </footer>
    </div>
  );
};

export default App;