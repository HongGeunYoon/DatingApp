import React, { useState } from 'react';
import axios from 'axios';

// IMPORTANT: Never use alert() or confirm() in production code. Use custom modals instead.

function ProfileForm({ onProfileCreated }) {
  const [formData, setFormData] = useState({
    nickname: '',
    age: '',
    gender: 'M', // 기본값 남성
    bio: '',
    interests: '',
    profile_picture: null, // 파일 객체를 저장할 필드 추가
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profile_picture' && files) {
      // 파일 입력 처리
      setFormData({ ...formData, [name]: files[0] });
    } else {
      // 텍스트 입력 처리
      setFormData({ ...formData, [name]: value });
    }
  };

  // ProfileForm.js (수정된 handleSubmit 부분)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const accessToken = localStorage.getItem('accessToken'); 
    
    if (!accessToken) {
      console.error("인증 오류: Access Token이 없습니다.");
      // alert 대신 콘솔 로그 및 사용자에게 피드백 제공
      alert("로그인이 필요합니다. 먼저 로그인해 주세요.");
      setLoading(false);
      return;
    }

    // 1. FormData 객체를 생성하여 이미지와 텍스트를 함께 전송 준비
    const dataToSend = new FormData();
    dataToSend.append('nickname', formData.nickname);
    dataToSend.append('age', formData.age);
    dataToSend.append('gender', formData.gender);
    dataToSend.append('bio', formData.bio);
    dataToSend.append('interests', formData.interests);
    
    // profile_picture가 null이 아닌 경우에만 append (옵션 필드 처리)
    if (formData.profile_picture) {
        dataToSend.append('profile_picture', formData.profile_picture);
    }
    
    try {
      // 2. 올바른 URL과 인증 헤더를 설정합니다.
      const url = 'http://127.0.0.1:8000/api/users/userprofile/';
      
      // 3. FormData를 사용할 때는 Content-Type을 설정하지 않습니다. (브라우저가 자동으로 multipart/form-data로 설정)
      const response = await axios.post(url, dataToSend, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // 'Content-Type': 'multipart/form-data' <- 이것을 명시적으로 설정하면 안 됩니다! (브라우저가 boundary를 자동으로 붙이도록 둡니다.)
        }
      });
      
      alert(`${response.data.nickname}님의 프로필이 성공적으로 생성되었습니다!`);
      onProfileCreated(response.data); 
    } catch (error) {
      console.error("프로필 생성 실패:", error.response?.data || error.message);
      
      const errorData = error.response?.data;
      if (error.response?.status === 401) {
        alert("로그인 세션이 만료되었거나 인증되지 않았습니다. 다시 로그인해주세요.");
      } else if (errorData && typeof errorData === 'object') {
        // DRF의 상세 오류 메시지 처리
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMessage = Array.isArray(errorData[firstErrorKey]) 
                           ? errorData[firstErrorKey].join(' ') 
                           : errorData[firstErrorKey];
        alert(`프로필 생성 실패 (${firstErrorKey}): ${errorMessage}`);
      } else {
        alert(`프로필 생성 실패: 알 수 없는 오류가 발생했습니다.`);
      }
    } finally {
        setLoading(false);
    }
  };


  return (
    <div style={{ 
        padding: '20px', 
        maxWidth: '400px', 
        margin: '20px auto', 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    }}>
      <h2>내 프로필 등록</h2>
      {loading && <p style={{color: 'blue'}}>프로필을 생성 중입니다...</p>}
      <form onSubmit={handleSubmit}>
        <input 
            name="nickname" 
            type="text" 
            placeholder="닉네임" 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        /><br/>
        <input 
            name="age" 
            type="number" 
            placeholder="나이" 
            onChange={handleChange} 
            required 
            min="18"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        /><br/>
        <select 
            name="gender" 
            onChange={handleChange} 
            value={formData.gender}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="M">남성</option>
          <option value="F">여성</option>
        </select><br/>
        
        {/* 이미지 파일 입력 필드 추가 */}
        <label htmlFor="profile_picture" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
            프로필 사진 (선택 사항)
        </label>
        <input 
            name="profile_picture" 
            id="profile_picture"
            type="file" 
            accept="image/*"
            onChange={handleChange} 
            style={{ width: '100%', marginBottom: '10px' }}
        /><br/>

        <textarea 
            name="bio" 
            placeholder="자기소개" 
            onChange={handleChange}
            rows="4"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'none' }}
        ></textarea><br/>
        <input 
            name="interests" 
            type="text" 
            placeholder="관심사 (예: 독서,여행)" 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ddd' }}
        /><br/>
        <button 
            type="submit" 
            disabled={loading}
            style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: loading ? '#aaa' : '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer' 
            }}
        >
          {loading ? '등록 중...' : '프로필 생성'}
        </button>
      </form>
    </div>
  );
}

export default ProfileForm;