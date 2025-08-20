import * as Dialog from '@radix-ui/react-dialog';
import styles from '@/features/common/styles/ui.module.css';
import legalStyles from '@/features/legal/styles/legal.module.css';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | 'marketing';
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const getTitle = () => {
    switch (type) {
      case 'terms': return '📋 서비스 이용약관';
      case 'privacy': return '🔒 개인정보 수집 및 이용 동의';
      case 'marketing': return '📧 마케팅 정보 수신 동의';
      default: return '약관';
    }
  };

  const getContent = () => {
    switch (type) {
      case 'terms': return <TermsContent />;
      case 'privacy': return <PrivacyContent />;
      case 'marketing': return <MarketingContent />;
      default: return null;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={legalStyles.modalOverlay} />
        <Dialog.Content className={legalStyles.modalContent}>
          <div className={legalStyles.modalHeader}>
            <Dialog.Title className={legalStyles.modalTitle}>
              {getTitle()}
            </Dialog.Title>
            <Dialog.Close className={legalStyles.closeButton}>
              ✕
            </Dialog.Close>
          </div>
          
          <div className={legalStyles.modalBody}>
            {getContent()}
          </div>
          
          <div className={legalStyles.modalFooter}>
            <button 
              className={styles.button}
              onClick={onClose}
            >
              확인
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function TermsContent() {
  return (
    <div className={legalStyles.legalContent}>
      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>제1조 (목적)</h3>
        <p className={legalStyles.paragraph}>
          이 약관은 ZeroWiki(이하 "회사")가 제공하는 위키 서비스(이하 "서비스")의 이용과 관련하여 
          회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>제2조 (정의)</h3>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>
            <strong>"서비스"</strong>란 회사가 제공하는 ZeroWiki 플랫폼 및 관련 서비스를 의미합니다.
          </li>
          <li className={legalStyles.listItem}>
            <strong>"이용자"</strong>란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
          </li>
          <li className={legalStyles.listItem}>
            <strong>"회원"</strong>이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
          </li>
          <li className={legalStyles.listItem}>
            <strong>"비회원"</strong>이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 말합니다.
          </li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>제3조 (약관의 효력 및 변경)</h3>
        <p className={legalStyles.paragraph}>
          ① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.
        </p>
        <p className={legalStyles.paragraph}>
          ② 회사는 합리적인 사유가 발생할 경우에는 이 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경된 약관의 내용과 시행일을 명시하여 현행 약관과 함께 서비스의 초기화면에 그 시행일 7일 이전부터 시행일 후 상당한 기간 동안 공지합니다.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>제4조 (회원가입)</h3>
        <p className={legalStyles.paragraph}>
          ① 회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
        </p>
        <p className={legalStyles.paragraph}>
          ② 회원가입신청서에는 다음 사항을 기재하여야 합니다.
        </p>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>이름</li>
          <li className={legalStyles.listItem}>닉네임</li>
          <li className={legalStyles.listItem}>이메일 주소</li>
          <li className={legalStyles.listItem}>연락처</li>
          <li className={legalStyles.listItem}>비밀번호</li>
          <li className={legalStyles.listItem}>기타 회사가 필요하다고 인정하는 사항</li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>제5조 (서비스의 제공 및 변경)</h3>
        <p className={legalStyles.paragraph}>
          ① 회사는 다음과 같은 업무를 수행합니다.
        </p>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>위키 문서 작성, 편집, 조회 서비스</li>
          <li className={legalStyles.listItem}>토론 및 커뮤니티 서비스</li>
          <li className={legalStyles.listItem}>기타 회사가 정하는 업무</li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>제6조 (서비스 이용시간)</h3>
        <p className={legalStyles.paragraph}>
          ① 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.
        </p>
        <p className={legalStyles.paragraph}>
          ② 회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>제7조 (회원의 의무)</h3>
        <p className={legalStyles.paragraph}>
          ① 이용자는 다음 행위를 하여서는 안 됩니다.
        </p>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>신청 또는 변경시 허위 내용의 등록</li>
          <li className={legalStyles.listItem}>타인의 정보 도용</li>
          <li className={legalStyles.listItem}>회사가 게시한 정보의 변경</li>
          <li className={legalStyles.listItem}>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
          <li className={legalStyles.listItem}>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
          <li className={legalStyles.listItem}>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
          <li className={legalStyles.listItem}>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
        </ul>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className={legalStyles.legalContent}>
      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>1. 개인정보의 수집 및 이용 목적</h3>
        <p className={legalStyles.paragraph}>
          ZeroWiki는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
        </p>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
          <li className={legalStyles.listItem}>회원자격 유지·관리, 서비스 부정이용 방지</li>
          <li className={legalStyles.listItem}>각종 고지·통지, 고충처리 등을 위한 의사소통 경로의 확보</li>
          <li className={legalStyles.listItem}>콘텐츠 등 기존 서비스 제공 및 신규 서비스 개발</li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>2. 수집하는 개인정보의 항목</h3>
        <div className={legalStyles.subsection}>
          <h4 className={legalStyles.subsectionTitle}>가. 필수항목</h4>
          <ul className={legalStyles.list}>
            <li className={legalStyles.listItem}>이름</li>
            <li className={legalStyles.listItem}>닉네임</li>
            <li className={legalStyles.listItem}>이메일 주소</li>
            <li className={legalStyles.listItem}>연락처(휴대전화번호)</li>
            <li className={legalStyles.listItem}>비밀번호</li>
          </ul>
        </div>
        <div className={legalStyles.subsection}>
          <h4 className={legalStyles.subsectionTitle}>나. 자동 수집 정보</h4>
          <ul className={legalStyles.list}>
            <li className={legalStyles.listItem}>서비스 이용기록</li>
            <li className={legalStyles.listItem}>접속 로그, 접속 IP 정보</li>
            <li className={legalStyles.listItem}>쿠키, 접속 일시</li>
          </ul>
        </div>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>3. 개인정보의 처리 및 보유기간</h3>
        <p className={legalStyles.paragraph}>
          ① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
        </p>
        <p className={legalStyles.paragraph}>
          ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
        </p>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}><strong>회원 가입 및 관리:</strong> 서비스 이용계약 또는 회원가입 해지시까지</li>
          <li className={legalStyles.listItem}><strong>재화 또는 서비스 제공:</strong> 재화·서비스 공급완료 및 요금결제·정산 완료시까지</li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>4. 개인정보의 제3자 제공</h3>
        <p className={legalStyles.paragraph}>
          ① 회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며,{' '}
          정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>5. 정보주체의 권리·의무 및 행사방법</h3>
        <p className={legalStyles.paragraph}>
          ① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
        </p>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>개인정보 처리현황 통지요구</li>
          <li className={legalStyles.listItem}>개인정보 열람요구</li>
          <li className={legalStyles.listItem}>개인정보 정정·삭제요구</li>
          <li className={legalStyles.listItem}>개인정보 처리정지요구</li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>6. 개인정보의 안전성 확보조치</h3>
        <p className={legalStyles.paragraph}>
          회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
        </p>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
          <li className={legalStyles.listItem}>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
          <li className={legalStyles.listItem}>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
        </ul>
      </section>
    </div>
  );
}

function MarketingContent() {
  return (
    <div className={legalStyles.legalContent}>
      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>1. 마케팅 정보 수신 동의</h3>
        <p className={legalStyles.paragraph}>
          ZeroWiki는 서비스 향상 및 이용자 맞춤형 서비스 제공을 위해 마케팅 정보 수신에 대한 동의를 받고 있습니다.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>2. 수집·이용 목적</h3>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>신규 서비스 및 이벤트 정보 안내</li>
          <li className={legalStyles.listItem}>맞춤형 콘텐츠 및 서비스 추천</li>
          <li className={legalStyles.listItem}>서비스 개선을 위한 설문조사</li>
          <li className={legalStyles.listItem}>프로모션 및 혜택 정보 제공</li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>3. 수집하는 정보</h3>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>이메일 주소</li>
          <li className={legalStyles.listItem}>서비스 이용 패턴</li>
          <li className={legalStyles.listItem}>관심 분야 및 선호도</li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>4. 정보 전송 방법</h3>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>이메일</li>
          <li className={legalStyles.listItem}>서비스 내 알림</li>
          <li className={legalStyles.listItem}>푸시 알림 (모바일 앱)</li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>5. 보유 및 이용기간</h3>
        <p className={legalStyles.paragraph}>
          마케팅 정보 수신 동의일로부터 회원 탈퇴 시 또는 동의 철회 시까지 보유 및 이용됩니다.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>6. 동의 거부 권리</h3>
        <p className={legalStyles.paragraph}>
          마케팅 정보 수신 동의는 선택사항이며, 동의하지 않으셔도 서비스 이용에는 제한이 없습니다. 다만, 맞춤형 서비스 및 이벤트 정보 제공이 제한될 수 있습니다.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h3 className={legalStyles.sectionTitle}>7. 동의 철회</h3>
        <p className={legalStyles.paragraph}>
          마케팅 정보 수신 동의는 언제든지 철회할 수 있으며, 다음 방법으로 철회 가능합니다.
        </p>
        <ul className={legalStyles.list}>
          <li className={legalStyles.listItem}>마이페이지에서 설정 변경</li>
          <li className={legalStyles.listItem}>이메일 하단의 수신거부 링크 클릭</li>
          <li className={legalStyles.listItem}>고객센터를 통한 요청</li>
        </ul>
      </section>
    </div>
  );
}
