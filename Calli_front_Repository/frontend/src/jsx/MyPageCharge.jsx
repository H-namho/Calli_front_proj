import React, { useState, useEffect } from 'react';
import '../css/MyPageCharge.css';

// ✅ [추가] 전역 axios 인스턴스 사용
// - 너가 이미 만든 src/api/api.js 의 api를 사용한다는 전제
import { api } from './api';

const CHARGE_OPTIONS = [
  { id: 1, credit: 10, bonus: 0, price: 10000 },
  { id: 2, credit: 50, bonus: 5, price: 50000 },
  { id: 3, credit: 100, bonus: 15, price: 100000, isPopular: true },
  { id: 4, credit: 200, bonus: 40, price: 200000 },
  { id: 5, credit: 500, bonus: 125, price: 500000 },
];

export default function MyPageCharge({ onCancel, onChargeComplete, currentTokens }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'card', 'transfer'

  // 카드 결제 정보 상태
  const [cardInfo, setCardInfo] = useState({
    num1: '', num2: '', num3: '', num4: '',
    expiry: '', cvc: '', pw: '', installment: '0'
  });

  // 계좌 이체 정보 상태
  const [transferInfo, setTransferInfo] = useState({
    bank: '', accountNum: '', owner: '', pw: ''
  });

  // ✅ [추가] 결제(=충전) 진행 상태/에러
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  // 컴포넌트 마운트 시 저장된 결제 정보 불러오기
  useEffect(() => {
    const savedCard = localStorage.getItem('lastCardInfo');
    const savedTransfer = localStorage.getItem('lastTransferInfo');

    if (savedCard) {
      const parsed = JSON.parse(savedCard);
      setCardInfo(prev => ({ ...prev, ...parsed, pw: '' }));
    }
    if (savedTransfer) {
      const parsed = JSON.parse(savedTransfer);
      setTransferInfo(prev => ({ ...prev, ...parsed, pw: '' }));
    }
  }, []);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setPaymentStep('select');
    setPayError(''); // ✅ [추가] 새 선택 시 에러 초기화
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setPaymentStep('select');
    setPayError('');          // ✅ [추가]
    setPaying(false);         // ✅ [추가]
    setCardInfo(prev => ({ ...prev, pw: '' }));
    setTransferInfo(prev => ({ ...prev, pw: '' }));
  };

  const handleCardChange = (field, value) => {
    setCardInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleTransferChange = (field, value) => {
    setTransferInfo(prev => ({ ...prev, [field]: value }));
  };

  /**
   * ✅ [추가] 간단한 결제 폼 유효성 체크
   * - 실제 PG 연동이 아니니, "입력 했는지"만 최소로 확인
   */
  const validatePaymentForm = (method) => {
    if (!selectedItem) return false;

    // 카드/계좌이체만 폼이 있으니 체크
    if (method === '신용카드') {
      const { num1, num2, num3, num4, expiry, cvc, pw } = cardInfo;
      if (!num1 || !num2 || !num3 || !num4 || !expiry || !cvc || !pw) {
        setPayError('카드 결제 정보를 모두 입력해주세요.');
        return false;
      }
    }
    if (method === '계좌이체') {
      const { bank, accountNum, owner, pw } = transferInfo;
      if (!bank || !accountNum || !owner || !pw) {
        setPayError('계좌이체 정보를 모두 입력해주세요.');
        return false;
      }
    }

    return true;
  };

  /**
   * ✅ [핵심 수정] 결제 버튼 클릭 → 백엔드 /api/plus 호출해서 실제 충전
   * - 성공 시 onChargeComplete(...)로 상위 토큰 상태 업데이트
   */
  const handlePayment = async (method) => {
    setPayError('');

    // ✅ [추가] 결제 폼 검사
    if (!validatePaymentForm(method)) return;

    // 결제 정보 저장 (비밀번호 제외)
    if (method === '신용카드') {
      const { pw, ...saveData } = cardInfo;
      localStorage.setItem('lastCardInfo', JSON.stringify(saveData));
    } else if (method === '계좌이체') {
      const { pw, ...saveData } = transferInfo;
      localStorage.setItem('lastTransferInfo', JSON.stringify(saveData));
    }

    // ✅ [추가] 실제 충전 호출
    setPaying(true);
    try {
      const totalCredits = selectedItem.credit + selectedItem.bonus;

      /**
       * ✅ [TODO] 백엔드 /api/plus 가 받는 JSON 구조에 맞춰 키를 수정해야 함
       * 지금은 "가장 일반적인" 형태로 넣어둠.
       *
       * 예시 A) { amount: 115, price: 100000, method: "카카오페이" }
       * 예시 B) { credit: 115 }
       * 예시 C) { plusAmount: 115, description: "충전" }
       */
      const payload = {
        amount: totalCredits,        // ✅ [TODO] 키명이 다르면 수정
        price: selectedItem.price,   // ✅ [선택] 백에서 가격 검증하면 사용
        method: method               // ✅ [선택] 로그 남길 때 사용
      };

      // ✅ [수정] 엔드포인트는 너가 말한 /api/plus
      const res = await api.post('/plus', payload);

      // ✅ [추가] 성공 처리 (백이 msg 내려주면 보여주기)
      // - res.data 형식은 네가 맞춰도 되고, 여기선 그냥 성공이면 처리
      alert(res?.data?.msg || `${selectedItem.price.toLocaleString()}원 결제가 완료되었습니다. (${method})`);

      // ✅ [중요] 상위(App/MyPage) 토큰 상태 업데이트
      if (onChargeComplete) {
        onChargeComplete(totalCredits, selectedItem.price, method);
      }

      handleCloseModal();
    } catch (err) {
      // ✅ [추가] 에러 메시지 표시
      setPayError(err?.response?.data?.msg || '충전에 실패했습니다. (서버 응답 없음)');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="mypage-inner">
      <div className="charge-container">
        <div className="charge-header">
          <h1 className="charge-title">토큰 충전소</h1>
          <p className="charge-subtitle">원하는 만큼 토큰을 충전하고 다양한 캘리그라피를 만들어보세요!</p>
          <div className="current-balance" style={{ marginTop: '10px', fontSize: '15px', color: '#6366F1', fontWeight: 'bold' }}>
            현재 보유 토큰: {currentTokens}개
          </div>
        </div>

        <div className="charge-grid">
          {CHARGE_OPTIONS.map((item) => (
            <div
              key={item.id}
              className={`charge-card ${item.isPopular ? 'popular' : ''}`}
              onClick={() => handleCardClick(item)}
            >
              <div className="card-top">
                <div className="credit-amount">
                  {item.credit} <span className="credit-unit">토큰</span>
                </div>
                {item.bonus > 0 && (
                  <div className="bonus-info">
                    <span className="bonus-badge">+{item.bonus} 보너스</span>
                    <span>= 총 {item.credit + item.bonus}개</span>
                  </div>
                )}
              </div>

              <div className="card-bottom">
                <div className="price-text">{item.price.toLocaleString()}원</div>
              </div>
            </div>
          ))}
        </div>
        <p className="vat-info">* 모든 결제 금액은 부가세(VAT)가 포함된 가격입니다.</p>
      </div>

      {/* 결제 모달 */}
      {selectedItem && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            {paymentStep === 'select' && (
              <>
                <h3 className="modal-title">결제하기</h3>

                <div className="selected-item-info">
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{selectedItem.credit + selectedItem.bonus} 토큰</span>
                    <div style={{ fontSize: '12px', color: '#888' }}>기본 {selectedItem.credit} + 보너스 {selectedItem.bonus}</div>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#0881dc' }}>
                    {selectedItem.price.toLocaleString()}원
                  </span>
                </div>

                {/* ✅ [추가] 에러 표시 */}
                {payError && (
                  <div style={{ color: '#ff4d4f', fontSize: 13, marginTop: 10, textAlign: 'left' }}>
                    {payError}
                  </div>
                )}

                <div className="payment-methods">
                  {/* ✅ [수정] 결제 중엔 버튼 비활성화 */}
                  <button className="pay-btn kakao" disabled={paying} onClick={() => handlePayment('카카오페이')}>
                    🟡 카카오페이로 결제
                  </button>
                  <button className="pay-btn naver" disabled={paying} onClick={() => handlePayment('네이버페이')}>
                    🟢 네이버페이로 결제
                  </button>
                  <button className="pay-btn pass" disabled={paying} onClick={() => handlePayment('PASS 결제')}>
                    🔴 PASS / 휴대폰 결제
                  </button>
                  <button className="pay-btn card" disabled={paying} onClick={() => setPaymentStep('card')}>
                    💳 신용카드 결제
                  </button>
                  <button className="pay-btn transfer" disabled={paying} onClick={() => setPaymentStep('transfer')}>
                    🏦 실시간 계좌이체
                  </button>
                </div>

                <button className="modal-close-btn" onClick={handleCloseModal} disabled={paying}>
                  취소하기
                </button>
              </>
            )}

            {paymentStep === 'card' && (
              <>
                <h3 className="modal-title">신용카드 결제</h3>

                {/* ✅ [추가] 에러 표시 */}
                {payError && (
                  <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 8, textAlign: 'left' }}>
                    {payError}
                  </div>
                )}

                <div className="payment-form">
                  <div className="form-group">
                    <label>카드 번호</label>
                    <div className="card-num-inputs">
                      <input type="text" maxLength="4" placeholder="0000" value={cardInfo.num1} onChange={(e) => handleCardChange('num1', e.target.value)} />
                      <input type="text" maxLength="4" placeholder="0000" value={cardInfo.num2} onChange={(e) => handleCardChange('num2', e.target.value)} />
                      <input type="text" maxLength="4" placeholder="0000" value={cardInfo.num3} onChange={(e) => handleCardChange('num3', e.target.value)} />
                      <input type="text" maxLength="4" placeholder="0000" value={cardInfo.num4} onChange={(e) => handleCardChange('num4', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>유효기간</label>
                      <input type="text" placeholder="MM/YY" maxLength="5" value={cardInfo.expiry} onChange={(e) => handleCardChange('expiry', e.target.value)} />
                    </div>
                    <div className="form-group half">
                      <label>CVC</label>
                      <input type="password" placeholder="***" maxLength="3" value={cardInfo.cvc} onChange={(e) => handleCardChange('cvc', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>할부 선택</label>
                    <select value={cardInfo.installment} onChange={(e) => handleCardChange('installment', e.target.value)}>
                      <option value="0">일시불</option>
                      <option value="2">2개월</option>
                      <option value="3">3개월</option>
                      <option value="4">4개월</option>
                      <option value="5">5개월</option>
                      <option value="6">6개월</option>
                      <option value="12">12개월</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>비밀번호 앞 2자리</label>
                    <input type="password" placeholder="**" maxLength="2" style={{ width: '50%' }} value={cardInfo.pw} onChange={(e) => handleCardChange('pw', e.target.value)} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="back-btn" disabled={paying} onClick={() => setPaymentStep('select')}>이전</button>
                  <button className="confirm-pay-btn" disabled={paying} onClick={() => handlePayment('신용카드')}>
                    {paying ? '처리 중...' : '결제하기'}
                  </button>
                </div>
              </>
            )}

            {paymentStep === 'transfer' && (
              <>
                <h3 className="modal-title">계좌이체</h3>

                {/* ✅ [추가] 에러 표시 */}
                {payError && (
                  <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 8, textAlign: 'left' }}>
                    {payError}
                  </div>
                )}

                <div className="payment-form">
                  <div className="form-group">
                    <label>은행 선택</label>
                    <select value={transferInfo.bank} onChange={(e) => handleTransferChange('bank', e.target.value)}>
                      <option value="">은행을 선택하세요</option>
                      <option value="KB국민은행">KB국민은행</option>
                      <option value="신한은행">신한은행</option>
                      <option value="우리은행">우리은행</option>
                      <option value="하나은행">하나은행</option>
                      <option value="NH농협">NH농협</option>
                      <option value="카카오뱅크">카카오뱅크</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>계좌번호</label>
                    <input type="text" placeholder="- 없이 입력하세요" value={transferInfo.accountNum} onChange={(e) => handleTransferChange('accountNum', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>예금주명</label>
                    <input type="text" placeholder="본인 명의 예금주" value={transferInfo.owner} onChange={(e) => handleTransferChange('owner', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>계좌 비밀번호 앞 2자리</label>
                    <input type="password" placeholder="**" maxLength="2" style={{ width: '50%' }} value={transferInfo.pw} onChange={(e) => handleTransferChange('pw', e.target.value)} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="back-btn" disabled={paying} onClick={() => setPaymentStep('select')}>이전</button>
                  <button className="confirm-pay-btn" disabled={paying} onClick={() => handlePayment('계좌이체')}>
                    {paying ? '처리 중...' : '결제하기'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
