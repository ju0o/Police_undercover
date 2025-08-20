import styles from '@/features/common/styles/ui.module.css';
import legalStyles from '@/features/legal/styles/legal.module.css';

export function TermsPage() {
  return (
    <div className={styles.container} style={{ maxWidth: '900px' }}>
      <div className={legalStyles.legalPageHeader}>
        <h1 className={legalStyles.pageTitle}>📋 서비스 이용약관</h1>
        <p className={legalStyles.pageSubtitle}>
          ZeroWiki 서비스 이용에 관한 약관입니다. 서비스를 이용하시기 전에 반드시 확인해주세요.
        </p>
        <div className={legalStyles.pageInfo}>
          <span>📅 최종 수정일: 2024년 1월 1일</span>
          <span>📝 버전: 1.0</span>
        </div>
      </div>

      <div className={legalStyles.legalContent}>
        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제1조 (목적)</h2>
          <p className={legalStyles.paragraph}>
            이 약관은 ZeroWiki(이하 "회사")가 제공하는 위키 서비스(이하 "서비스")의 이용과 관련하여 
            회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제2조 (정의)</h2>
          <p className={legalStyles.paragraph}>
            이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
          </p>
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
            <li className={legalStyles.listItem}>
              <strong>"콘텐츠"</strong>란 서비스에서 제공되는 모든 정보, 텍스트, 그래픽, 링크 및 기타 자료를 말합니다.
            </li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제3조 (약관의 효력 및 변경)</h2>
          <p className={legalStyles.paragraph}>
            ① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ② 회사는 합리적인 사유가 발생할 경우에는 이 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경된 약관의 내용과 시행일을 명시하여 현행 약관과 함께 서비스의 초기화면에 그 시행일 7일 이전부터 시행일 후 상당한 기간 동안 공지합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ③ 이용자가 변경된 약관에 동의하지 않는 경우, 이용자는 본인의 회원등록을 취소(회원탈퇴)할 수 있으며, 계속 사용하는 경우에는 약관 변경에 대한 동의로 간주됩니다.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제4조 (회원가입)</h2>
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
          <p className={legalStyles.paragraph}>
            ③ 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
          </p>
          <ul className={legalStyles.list}>
            <li className={legalStyles.listItem}>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
            <li className={legalStyles.listItem}>실명이 아니거나 타인의 명의를 이용한 경우</li>
            <li className={legalStyles.listItem}>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
            <li className={legalStyles.listItem}>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제5조 (서비스의 제공 및 변경)</h2>
          <p className={legalStyles.paragraph}>
            ① 회사는 다음과 같은 업무를 수행합니다.
          </p>
          <ul className={legalStyles.list}>
            <li className={legalStyles.listItem}>위키 문서 작성, 편집, 조회 서비스</li>
            <li className={legalStyles.listItem}>토론 및 커뮤니티 서비스</li>
            <li className={legalStyles.listItem}>검색 및 분류 서비스</li>
            <li className={legalStyles.listItem}>사용자 간 협업 도구 제공</li>
            <li className={legalStyles.listItem}>기타 회사가 정하는 업무</li>
          </ul>
          <p className={legalStyles.paragraph}>
            ② 회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수 있으며, 변경 시 사전에 공지합니다.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제6조 (서비스 이용시간)</h2>
          <p className={legalStyles.paragraph}>
            ① 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ② 회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
          </p>
          <p className={legalStyles.paragraph}>
            ③ 회사는 서비스의 제공에 지장이 있는 경우에는 서비스 제공시간을 별도로 정할 수 있습니다.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제7조 (회원의 의무)</h2>
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
            <li className={legalStyles.listItem}>스팸, 광고성 정보의 무분별한 게시</li>
            <li className={legalStyles.listItem}>다른 이용자의 개인정보를 수집, 저장, 공개하는 행위</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제8조 (저작권의 귀속 및 이용제한)</h2>
          <p className={legalStyles.paragraph}>
            ① 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ② 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.
          </p>
          <p className={legalStyles.paragraph}>
            ③ 이용자가 서비스에 게시한 콘텐츠의 저작권은 해당 이용자에게 귀속되나, 회사는 서비스 운영을 위해 필요한 범위 내에서 해당 콘텐츠를 이용할 수 있습니다.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제9조 (손해배상)</h2>
          <p className={legalStyles.paragraph}>
            ① 회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 고의 또는 중과실에 의한 경우를 제외하고는 이에 대하여 책임을 부담하지 아니합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ② 회사가 개별서비스 제공자와 제휴 계약을 체결하여 회원에게 개별서비스를 제공하는 경우에 회원이 이들과의 개별서비스 이용계약과 관련하여 손해를 입은 경우에 대하여는 회사는 책임을 지지 않습니다.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제10조 (분쟁해결)</h2>
          <p className={legalStyles.paragraph}>
            ① 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ② 회사와 이용자 간에 발생한 전자상거래 분쟁과 관련하여 이용자의 피해구제신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>제11조 (재판권 및 준거법)</h2>
          <p className={legalStyles.paragraph}>
            ① 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다. 다만, 제소 당시 이용자의 주소 또는 거소가 분명하지 않거나 외국 거주자의 경우에는 민사소송법상의 관할법원에 제기합니다.
          </p>
          <p className={legalStyles.paragraph}>
            ② 회사와 이용자 간에 제기된 전자상거래 소송에는 한국법을 적용합니다.
          </p>
        </section>

        <div className={legalStyles.footer}>
          <p>본 약관은 2024년 1월 1일부터 시행됩니다.</p>
          <p>문의사항이 있으시면 고객센터(support@zerowiki.com)로 연락해주세요.</p>
        </div>
      </div>
    </div>
  );
}
