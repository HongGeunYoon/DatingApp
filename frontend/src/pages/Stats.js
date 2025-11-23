import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader2, Heart, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'; // 아이콘 임포트

// API 엔드포인트
const API_URL = 'http://127.0.0.1:8000/api/users/stats/';

// 통계 지표를 위한 카드 컴포넌트
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`p-6 bg-white rounded-xl shadow-lg transform transition duration-300 hover:scale-[1.02] border-t-4 border-${color}-500 w-full sm:w-1/2 lg:w-1/4 min-w-[200px] mx-2 my-3`}>
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  </div>
);

// 메인 통계 컴포넌트
const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        API_URL,
        { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }
      );
      
      // 서버 응답이 성공적이면 (200 OK) 데이터를 상태에 저장
      setStats(response.data); 
    } catch (err) {
      console.error("통계 불러오기 실패:", err);
      // 401 Unauthorized 에러 발생 시
      if (err.response?.status === 401) {
        setError('인증 오류: 토큰이 만료되었거나 유효하지 않습니다.');
      } else {
        setError('통계 데이터를 불러오는 중 오류가 발생했습니다. 서버 연결을 확인하세요.');
      }
      setStats(null); // 데이터 초기화
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mr-3" />
        <p className="text-lg text-gray-600">통계 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg shadow-inner mt-8">
        <p className="text-xl font-semibold text-red-600">🚨 오류 발생</p>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  // 데이터가 성공적으로 로드되었으나, API에서 예상치 못한 빈 객체 등이 반환된 경우 대비
  if (!stats) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg shadow-inner mt-8">
        <p className="text-xl font-semibold text-yellow-600">ℹ️ 데이터 없음</p>
        <p className="text-gray-600 mt-2">사용자 통계 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }
  
  // 통계 데이터 구조 (예상):
  // {
  //   "likes_sent": 50, 
  //   "likes_received": 35, 
  //   "matches": 10,
  //   "dislikes_sent": 15,
  //   "total_swipes": 65
  // }
  
  const totalInteractions = (stats.likes_sent || 0) + (stats.dislikes_sent || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 rounded-xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-800">내 매칭 활동 분석 📊</h1>
        <p className="text-gray-500 mt-2">당신의 매칭 여정을 한눈에 확인하세요.</p>
      </header>

      {/* 통계 카드 섹션 */}
      <div className="flex flex-wrap justify-center -mx-2">
        <StatCard 
          icon={Heart} 
          title="보낸 좋아요 (Likes Sent)" 
          value={stats.likes_sent || 0} 
          color="pink" 
        />
        <StatCard 
          icon={ThumbsUp} 
          title="받은 좋아요 (Likes Received)" 
          value={stats.likes_received || 0} 
          color="green" 
        />
        <StatCard 
          icon={MessageSquare} 
          title="성사된 매칭 (Matches)" 
          value={stats.matches || 0} 
          color="blue" 
        />
        <StatCard 
          icon={ThumbsDown} 
          title="보낸 싫어요 (Dislikes Sent)" 
          value={stats.dislikes_sent || 0} 
          color="red" 
        />
      </div>

      {/* 상세 분석 섹션 */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-gray-700 border-b pb-2 mb-6">활동 지표 상세</h2>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 좋아요 비율 */}
            <div className="border border-indigo-100 p-4 rounded-lg">
              <p className="text-lg font-semibold text-indigo-600">👍 좋아요/활동 비율</p>
              <div className="mt-2 text-3xl font-bold text-indigo-800">
                {totalInteractions > 0 ? 
                  `${((stats.likes_sent / totalInteractions) * 100).toFixed(1)}%` 
                  : '0%'}
              </div>
              <p className="text-sm text-gray-500 mt-1">총 상호작용 {totalInteractions}회 중 좋아요를 보낸 비율</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div 
                  className="bg-pink-500 h-2.5 rounded-full" 
                  style={{ width: `${totalInteractions > 0 ? (stats.likes_sent / totalInteractions) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* 매칭 성공률 */}
            <div className="border border-green-100 p-4 rounded-lg">
              <p className="text-lg font-semibold text-green-600">⚡ 매칭 성공률</p>
              <div className="mt-2 text-3xl font-bold text-green-800">
                {stats.likes_sent > 0 ? 
                  `${((stats.matches / stats.likes_sent) * 100).toFixed(1)}%` 
                  : '0%'}
              </div>
              <p className="text-sm text-gray-500 mt-1">당신이 보낸 좋아요 대비 매칭으로 이어진 비율</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${stats.likes_sent > 0 ? (stats.matches / stats.likes_sent) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
      
    </div>
  );
};

export default Stats;