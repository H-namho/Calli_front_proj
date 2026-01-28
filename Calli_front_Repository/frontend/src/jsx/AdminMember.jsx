import React, { useEffect, useState } from 'react';
import '../css/Admin.css';
import { api } from './api'; // ✅ 너가 쓰는 axios 인스턴스 경로 맞춰줘

export default function AdminMember() {
  const [users, setUsers] = useState([]);

  // ✅ 날짜 포맷 (LocalDateTime -> YYYY-MM-DD)
  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    // 브라우저에서 보기 좋게 yyyy-mm-dd로
    return d.toISOString().split('T')[0];
  };

  // ✅ 서버에서 회원 목록 가져오기
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // ✅ endpoint: /api/Admin/manage
        const res = await api.get('/Admin/manage');
        
        setUsers(res.data || []);
      } catch (err) {
        console.log('❌ 관리자 회원 목록 불러오기 실패:', err);
        setUsers([]);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="admin-inquiry-container">
      <div className="inquiry-table-wrapper" style={{ marginTop: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th width="50">No</th>
              <th width="120">회원 아이디</th>
              <th width="220">이메일</th>
              <th width="120">최종 접속일</th>
              <th width="100">미접속 일수</th>
              <th width="80">상태</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                  회원 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user, idx) => {
                // ✅ DTO 기준 값 매핑
                // user.humanAt = Long (미접속 일수)
                // user.lastAt = LocalDateTime (ISO String)
                const inactiveDays = user?.humanAt; // Long
                const isDormant = user?.status === '휴면' || user?.status === '휴먼';

                return (
                  <tr key={user?.userId ?? idx}>
                    <td>{idx + 1}</td>
                    <td>{user?.userName}</td>
                    <td>{user?.userEmail}</td>
                    <td>{formatDate(user?.lastAt)}</td>

                    <td
                      style={{
                        color: isDormant ? '#fa5252' : '#868e96',
                        fontWeight: isDormant ? 'bold' : 'normal',
                      }}
                    >
                      {inactiveDays === null || inactiveDays === undefined ? '-' : `${inactiveDays}일`}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          isDormant ? 'badge-waiting' : 'badge-completed'
                        }`}
                      >
                        {user?.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
