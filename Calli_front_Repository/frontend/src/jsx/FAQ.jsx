import React, { useEffect } from 'react';
import '../css/App.css';

const faqData = [
    {
        q: '무료로 이용할 수 있나요?',
        a: '신규 가입 시 무료 생성 3회를 제공합니다. 이후에는 토큰을 충전하여 이용하실 수 있습니다.'
    },
    {
        q: '생성된 이미지는 상업적으로 사용 가능한가요?',
        a: '네, 생성하신 캘리그라피 이미지는 개인 및 상업적 용도로 자유롭게 사용하실 수 있습니다. 단, 생성된 이미지 자체를 재판매하는 행위는 제한될 수 있습니다.'
    },
    {
        q: '어떤 스타일의 글씨체를 만들 수 있나요?',
        a: '현재 판본체, 궁서체, 흘림체 등 다양한 한국 전통 서체 스타일을 제공하며, 지속적으로 새로운 스타일이 업데이트될 예정입니다.'
    },
    {
        q: '토큰 충전은 어떻게 하나요?',
        a: '마이페이지 > 토큰 충전소 메뉴에서 신용카드, 계좌이체 등 다양한 결제 수단을 통해 충전하실 수 있습니다.'
    },
    {
        q: '비밀번호를 잊어버렸어요.',
        a: '로그인 화면 하단의 "계정 찾기" 링크를 통해 비밀번호를 재설정하실 수 있습니다.'
    }
];

export default function FAQ() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-container" style={{ paddingTop: '80px', paddingBottom: '100px', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px', fontWeight: '700' }}>자주 묻는 질문</h1>

            <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {faqData.map((item, index) => (
                    <div
                        key={index}
                        className="faq-item"
                        style={{
                            border: '1px solid #eee',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div
                            className="faq-question"
                            style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid #f5f5f5',
                                backgroundColor: '#fdfdfd',
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: '600',
                                color: '#333',
                                fontSize: '16px'
                            }}
                        >
                            <span style={{ color: '#0881dc', marginRight: '8px', fontWeight: '800' }}>Q.</span>
                            {item.q}
                        </div>
                        <div className="faq-answer" style={{
                            padding: '24px',
                            color: '#555',
                            lineHeight: '1.6',
                            fontSize: '15px'
                        }}>
                            <span style={{ color: '#4CAF50', marginRight: '8px', fontWeight: '800' }}>A.</span>
                            {item.a}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
