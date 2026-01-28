
import React, { useState, useEffect } from 'react';
import '../css/App.css'; // Global styles (if needed)

const notices = [
    {
        id: 1,
        title: '[공지] Calli For You 서비스 정식 오픈 안내',
        date: '2025-01-01',
        content: `안녕하세요, Calli For You입니다.\n\n오랫동안 준비해온 AI 감성 캘리그라피 서비스가 드디어 정식 오픈했습니다.\n여러분의 소중한 메시지를 더욱 아름답게 만들어 드릴 수 있도록 최선을 다하겠습니다.\n\n감사합니다.`
    },
    {
        id: 2,
        title: '[이벤트] 신규 가입 회원 무료 이벤트',
        date: '2025-01-05',
        content: `오픈 기념으로 신규 가입하신 모든 분들께 무료 생성 3회를 제공해 드립니다.\n지금 바로 회원가입하고 나만의 캘리그라피를 만들어보세요!`
    },
    {
        id: 3,
        title: '[안내] 설 연휴 고객센터 휴무 안내',
        date: '2025-01-20',
        content: `설 연휴 기간 동안 고객센터 운영이 중단됩니다.\n1:1 문의 남겨주시면 연휴가 끝나는 대로 순차적으로 답변 드리겠습니다.\n즐거운 명절 보내세요.`
    }
];

export default function Notice() {
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleNotice = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="page-container" style={{ paddingTop: '80px', paddingBottom: '100px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px', fontWeight: '700' }}>공지사항</h1>

            <div className="notice-list" style={{ borderTop: '2px solid #333' }}>
                {notices.map(item => (
                    <div key={item.id} className="notice-item" style={{ borderBottom: '1px solid #eee' }}>
                        <div
                            className="notice-header"
                            onClick={() => toggleNotice(item.id)}
                            style={{
                                padding: '20px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: expandedId === item.id ? '#f8f9fa' : 'white'
                            }}
                        >
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{item.title}</span>
                            <span style={{ fontSize: '14px', color: '#888' }}>{item.date}</span>
                        </div>
                        {expandedId === item.id && (
                            <div className="notice-content" style={{ padding: '30px 20px', backgroundColor: '#f8f9fa', whiteSpace: 'pre-line', fontSize: '15px', color: '#555', lineHeight: '1.6' }}>
                                {item.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
