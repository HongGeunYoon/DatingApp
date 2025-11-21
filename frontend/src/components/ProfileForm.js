import React, { useState } from 'react';
import axios from 'axios';

// props로 onProfileCreated 콜백 함수를 받습니다.
const ProfileForm = ({ onProfileCreated }) => {
    // ... 기존 상태 관리 코드 ...
    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('남성');
    const [bio, setBio] = useState('');
    const [interests, setInterests] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [error, setError] = useState('');

    // **[중요]** API 엔드포인트는 실제 서버 주소로 변경해야 합니다.
    const API_BASE_URL = 'http://localhost:8000'; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        formData.append('nickname', nickname);
        formData.append('age', age);
        formData.append('gender', gender);
        formData.append('bio', bio);
        formData.append('interests', interests);
        if (profilePic) {
            formData.append('profile_picture', profilePic);
        }

        try {
            // 토큰을 포함하여 요청을 보냅니다. (로컬 스토리지 또는 Context에서 가져온다고 가정)
            const token = localStorage.getItem('token'); 
            
            const response = await axios.post(
                `${API_BASE_URL}/api/profile/create/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Token ${token}`, // 인증 토큰 사용
                    },
                }
            );

            // 1. 프로필 생성 성공 로그
            console.log('프로필 생성 성공:', response.data);

            // 2. 성공 시, 부모 컴포넌트에 알리는 콜백 함수 호출
            if (onProfileCreated) {
                onProfileCreated();
            }

        } catch (err) {
            console.error('프로필 생성 실패:', err.response?.data || err.message);
            setError('프로필 생성에 실패했습니다. 다시 시도해 주세요.');
        }
    };

    // ... 기존 폼 렌더링 코드 ...
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
                    Step 1: 프로필 생성
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                {/* 닉네임 */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">닉네임</label>
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>
                
                {/* 나이 */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">나이</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>

                {/* 성별 */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">성별</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                    </select>
                </div>

                {/* 자기소개 */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">자기소개</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-24 leading-tight focus:outline-none focus:shadow-outline" required></textarea>
                </div>

                {/* 관심사 */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">관심사 (쉼표로 구분)</label>
                    <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>

                {/* 프로필 사진 */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">프로필 사진</label>
                    <input type="file" onChange={(e) => setProfilePic(e.target.files[0])}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>
                
                <button type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">
                    프로필 생성 및 다음 단계로
                </button>
            </form>
        </div>
    );
};

export default ProfileForm;