import styles from '@/features/common/styles/ui.module.css';
import legalStyles from '@/features/legal/styles/legal.module.css';

export function PrivacyPage() {
  return (
    <div className={styles.container} style={{ maxWidth: '900px' }}>
      <div className={legalStyles.legalPageHeader}>
        <h1 className={legalStyles.pageTitle}>🔒 개인정보처리방침</h1>
        <p className={legalStyles.pageSubtitle}>
          ZeroWiki는 이용자의 개인정보를 중요하게 생각하며, 개인정보보호법을 준수하고 있습니다.
        </p>
        <div className={legalStyles.pageInfo}>
          <span>📅 최종 수정일: 2024년 1월 1일</span>
          <span>📝 버전: 1.0</span>
        </div>
      </div>

      <div className={legalStyles.legalContent}>
        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>1. 개인정보의 수집 및 이용 목적</h2>
          <p className={legalStyles.paragraph}>
            ZeroWiki('회사')는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className={legalStyles.list}>
            <li className={legalStyles.listItem}>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
            <li className={legalStyles.listItem}>회원자격 유지·관리, 서비스 부정이용 방지</li>
            <li className={legalStyles.listItem}>각종 고지·통지, 고충처리 등을 위한 의사소통 경로의 확보</li>
            <li className={legalStyles.listItem}>콘텐츠 등 기존 서비스 제공 및 신규 서비스 개발</li>
            <li className={legalStyles.listItem}>맞춤형 서비스 제공, 통계학적 특성에 따른 서비스 제공 및 광고 게재</li>
            <li className={legalStyles.listItem}>법령 및 회사 약관을 위반하는 회원에 대한 이용 제한 조치, 부정 이용 행위를 포함하여 서비스의 원활한 운영에 지장을 주는 행위에 대한 방지 및 제재</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>2. 수집하는 개인정보의 항목</h2>
          
          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>가. 회원가입 시 수집하는 필수정보</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}>이름</li>
              <li className={legalStyles.listItem}>닉네임</li>
              <li className={legalStyles.listItem}>이메일 주소</li>
              <li className={legalStyles.listItem}>연락처(휴대전화번호)</li>
              <li className={legalStyles.listItem}>비밀번호</li>
            </ul>
          </div>

          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>나. 서비스 이용 과정에서 자동으로 생성되어 수집되는 정보</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}>서비스 이용기록</li>
              <li className={legalStyles.listItem}>접속 로그, 쿠키, 접속 IP 정보</li>
              <li className={legalStyles.listItem}>기기정보(OS, 화면사이즈, 디바이스 아이디)</li>
              <li className={legalStyles.listItem}>위치정보(서비스 이용 시)</li>
            </ul>
          </div>

          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>다. 추가 서비스 이용 시 수집되는 정보</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}>프로필 사진</li>
              <li className={legalStyles.listItem}>자기소개</li>
              <li className={legalStyles.listItem}>관심 분야</li>
              <li className={legalStyles.listItem}>활동 이력</li>
            </ul>
          </div>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>3. 개인정보의 처리 및 보유기간</h2>
          <p className={legalStyles.paragraph}>
            ① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
          </p>
          
          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>가. 회원 가입 및 관리</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}><strong>보유기간:</strong> 서비스 이용계약 또는 회원가입 해지시까지</li>
              <li className={legalStyles.listItem}><strong>예외:</strong> 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료시까지</li>
            </ul>
          </div>

          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>나. 재화 또는 서비스 제공</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}><strong>보유기간:</strong> 재화·서비스 공급완료 및 요금결제·정산 완료시까지</li>
              <li className={legalStyles.listItem}><strong>예외:</strong> 다만, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존</li>
            </ul>
          </div>

          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>다. 관련 법령에 의한 정보보유</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li className={legalStyles.listItem}>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li className={legalStyles.listItem}>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li className={legalStyles.listItem}>표시·광고에 관한 기록: 6개월 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li className={legalStyles.listItem}>서비스 방문 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </div>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>4. 개인정보의 제3자 제공</h2>
          <p className={legalStyles.paragraph}>
            ① 회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ② 회사는 다음과 같은 경우에 개인정보를 제3자에게 제공할 수 있습니다.
          </p>
          <ul className={legalStyles.list}>
            <li className={legalStyles.listItem}>정보주체로부터 별도의 동의를 받은 경우</li>
            <li className={legalStyles.listItem}>법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
            <li className={legalStyles.listItem}>공공기관이 법령 등에서 정하는 소관 업무의 수행을 위하여 불가피한 경우</li>
            <li className={legalStyles.listItem}>정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>5. 개인정보처리의 위탁</h2>
          <p className={legalStyles.paragraph}>
            ① 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
          </p>
          
          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>가. 클라우드 서비스</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}><strong>위탁받는 자:</strong> Google Cloud Platform, Amazon Web Services</li>
              <li className={legalStyles.listItem}><strong>위탁하는 업무의 내용:</strong> 클라우드 서버 운영 및 관리</li>
              <li className={legalStyles.listItem}><strong>위탁기간:</strong> 회원탈퇴시 또는 위탁계약 종료시까지</li>
            </ul>
          </div>

          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>나. 이메일 발송 서비스</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}><strong>위탁받는 자:</strong> SendGrid, Amazon SES</li>
              <li className={legalStyles.listItem}><strong>위탁하는 업무의 내용:</strong> 이메일 발송 대행</li>
              <li className={legalStyles.listItem}><strong>위탁기간:</strong> 회원탈퇴시 또는 위탁계약 종료시까지</li>
            </ul>
          </div>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>6. 정보주체의 권리·의무 및 행사방법</h2>
          <p className={legalStyles.paragraph}>
            ① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
          </p>
          <ul className={legalStyles.list}>
            <li className={legalStyles.listItem}>개인정보 처리현황 통지요구</li>
            <li className={legalStyles.listItem}>개인정보 열람요구</li>
            <li className={legalStyles.listItem}>개인정보 정정·삭제요구</li>
            <li className={legalStyles.listItem}>개인정보 처리정지요구</li>
          </ul>
          <p className={legalStyles.paragraph}>
            ② 제1항에 따른 권리 행사는 회사에 대해 개인정보보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.
          </p>
          <p className={legalStyles.paragraph}>
            ③ 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>7. 개인정보의 파기</h2>
          <p className={legalStyles.paragraph}>
            ① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ② 개인정보 파기의 절차 및 방법은 다음과 같습니다.
          </p>
          
          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>가. 파기절차</h3>
            <p className={legalStyles.paragraph}>
              회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.
            </p>
          </div>

          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>나. 파기방법</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다</li>
              <li className={legalStyles.listItem}>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다</li>
            </ul>
          </div>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>8. 개인정보의 안전성 확보조치</h2>
          <p className={legalStyles.paragraph}>
            회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
          </p>
          
          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>가. 관리적 조치</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}>내부관리계획 수립 및 시행</li>
              <li className={legalStyles.listItem}>정기적인 자체 감사 실시</li>
              <li className={legalStyles.listItem}>개인정보 담당직원의 최소화 및 교육</li>
              <li className={legalStyles.listItem}>외부업체 위탁 시 보안서약서 체결</li>
            </ul>
          </div>

          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>나. 기술적 조치</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}>개인정보처리시스템 등의 접근권한 관리</li>
              <li className={legalStyles.listItem}>접근통제시스템 설치</li>
              <li className={legalStyles.listItem}>고유식별정보 등의 암호화</li>
              <li className={legalStyles.listItem}>해킹 등에 대비한 기술적 대책</li>
              <li className={legalStyles.listItem}>보안프로그램 설치 및 갱신</li>
              <li className={legalStyles.listItem}>개인정보의 위조·변조 방지</li>
            </ul>
          </div>

          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>다. 물리적 조치</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}>전산실, 자료보관실 등의 접근통제</li>
              <li className={legalStyles.listItem}>개인정보가 포함된 서류, 보조저장매체 등의 잠금장치 사용</li>
            </ul>
          </div>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>9. 개인정보 보호책임자</h2>
          <p className={legalStyles.paragraph}>
            ① 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          
          <div className={legalStyles.subsection}>
            <h3 className={legalStyles.subsectionTitle}>개인정보 보호책임자</h3>
            <ul className={legalStyles.list}>
              <li className={legalStyles.listItem}><strong>성명:</strong> 김개인정보</li>
              <li className={legalStyles.listItem}><strong>직책:</strong> 개인정보보호팀장</li>
              <li className={legalStyles.listItem}><strong>연락처:</strong> privacy@zerowiki.com, 02-1234-5678</li>
            </ul>
          </div>

          <p className={legalStyles.paragraph}>
            ② 정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다. 회사는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>10. 개인정보 처리방침 변경</h2>
          <p className={legalStyles.paragraph}>
            ① 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>
        </section>

        <div className={legalStyles.footer}>
          <p>본 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.</p>
          <p>개인정보 관련 문의: privacy@zerowiki.com</p>
        </div>
      </div>
    </div>
  );
}
