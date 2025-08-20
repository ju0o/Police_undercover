import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '@/features/common/styles/ui.module.css';
import adminStyles from '@/features/admin/styles/admin.module.css';


// 샘플 데이터
const dashboardStats = {
  users: {
    total: 1234,
    newToday: 23,
    activeToday: 456,
    blocked: 8
  },
  content: {
    totalDocs: 2847,
    newToday: 12,
    pendingApproval: 34,
    rejected: 15
  },
  activity: {
    editsToday: 89,
    proposalsToday: 15,
    discussionsToday: 27,
    reportsToday: 3
  },
  system: {
    serverStatus: 'healthy',
    dbConnections: 45,
    responseTime: '120ms',
    uptime: '99.9%'
  }
};

const recentUsers = [
  { id: '1', name: '김철수', nickname: '코딩왕', email: 'kim@example.com', role: 'intermediate', joinedAt: '2시간 전', status: 'active' },
  { id: '2', name: '박영희', nickname: '위키러버', email: 'park@example.com', role: 'newbie', joinedAt: '4시간 전', status: 'active' },
  { id: '3', name: '이민수', nickname: '문서마스터', email: 'lee@example.com', role: 'advanced', joinedAt: '6시간 전', status: 'pending' },
  { id: '4', name: '최지현', nickname: '편집자', email: 'choi@example.com', role: 'newbie', joinedAt: '8시간 전', status: 'blocked' }
];

const recentContent = [
  { id: '1', title: 'React Hooks 완벽 가이드', author: '코딩왕', type: 'create', status: 'approved', time: '30분 전' },
  { id: '2', title: 'JavaScript 비동기 처리', author: '위키러버', type: 'edit', status: 'pending', time: '1시간 전' },
  { id: '3', title: 'TypeScript 고급 기법', author: '문서마스터', type: 'create', status: 'approved', time: '2시간 전' },
  { id: '4', title: 'Vue.js vs React 비교', author: '편집자', type: 'edit', status: 'rejected', time: '3시간 전' }
];

const systemAlerts = [
  { id: '1', type: 'warning', message: '서버 CPU 사용률이 80%를 초과했습니다', time: '10분 전' },
  { id: '2', type: 'info', message: '데이터베이스 백업이 완료되었습니다', time: '1시간 전' },
  { id: '3', type: 'error', message: '스팸 필터에서 5건의 의심스러운 활동을 감지했습니다', time: '2시간 전' }
];

export function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'content' | 'system'>('overview');

  return (
    <div className={adminStyles.adminDashboard}>
      {/* 헤더 */}
      <div className={adminStyles.dashboardHeader}>
        <h1 className={adminStyles.dashboardTitle}>👑 관리자 대시보드</h1>
        <p className={adminStyles.dashboardSubtitle}>
          ZeroWiki 시스템 현황과 사용자 활동을 관리하세요
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className={adminStyles.tabNavigation}>
        <button
          className={`${adminStyles.tabButton} ${selectedTab === 'overview' ? adminStyles.tabActive : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          📊 개요
        </button>
        <button
          className={`${adminStyles.tabButton} ${selectedTab === 'users' ? adminStyles.tabActive : ''}`}
          onClick={() => setSelectedTab('users')}
        >
          👥 사용자 관리
        </button>
        <button
          className={`${adminStyles.tabButton} ${selectedTab === 'content' ? adminStyles.tabActive : ''}`}
          onClick={() => setSelectedTab('content')}
        >
          📝 콘텐츠 관리
        </button>
        <button
          className={`${adminStyles.tabButton} ${selectedTab === 'system' ? adminStyles.tabActive : ''}`}
          onClick={() => setSelectedTab('system')}
        >
          ⚙️ 시스템 관리
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className={adminStyles.tabContent}>
        {selectedTab === 'overview' && <OverviewTab stats={dashboardStats} alerts={systemAlerts} />}
        {selectedTab === 'users' && <UsersTab users={recentUsers} />}
        {selectedTab === 'content' && <ContentTab content={recentContent} />}
        {selectedTab === 'system' && <SystemTab stats={dashboardStats.system} />}
      </div>
    </div>
  );
}

function OverviewTab({ stats, alerts }: { stats: typeof dashboardStats; alerts: typeof systemAlerts }) {
  return (
    <div className={adminStyles.overviewGrid}>
      {/* 통계 카드들 */}
      <div className={adminStyles.statsGrid}>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>👥</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>{stats.users.total.toLocaleString()}</div>
            <div className={adminStyles.statLabel}>전체 사용자</div>
            <div className={adminStyles.statChange}>+{stats.users.newToday} 오늘</div>
          </div>
        </div>

        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>📄</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>{stats.content.totalDocs.toLocaleString()}</div>
            <div className={adminStyles.statLabel}>전체 문서</div>
            <div className={adminStyles.statChange}>+{stats.content.newToday} 오늘</div>
          </div>
        </div>

        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>✏️</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>{stats.activity.editsToday}</div>
            <div className={adminStyles.statLabel}>오늘 편집</div>
            <div className={adminStyles.statChange}>+{stats.activity.proposalsToday} 제안</div>
          </div>
        </div>

        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>⚠️</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>{stats.content.pendingApproval}</div>
            <div className={adminStyles.statLabel}>승인 대기</div>
            <div className={adminStyles.statChange}>{stats.activity.reportsToday} 신고</div>
          </div>
        </div>
      </div>

      {/* 시스템 알림 */}
      <div className={adminStyles.alertsPanel}>
        <h3 className={adminStyles.panelTitle}>🔔 시스템 알림</h3>
        <div className={adminStyles.alertsList}>
          {alerts.map(alert => (
            <div key={alert.id} className={`${adminStyles.alertItem} ${adminStyles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}>
              <div className={adminStyles.alertIcon}>
                {alert.type === 'warning' && '⚠️'}
                {alert.type === 'info' && 'ℹ️'}
                {alert.type === 'error' && '🚨'}
              </div>
              <div className={adminStyles.alertContent}>
                <div className={adminStyles.alertMessage}>{alert.message}</div>
                <div className={adminStyles.alertTime}>{alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className={adminStyles.quickActions}>
        <h3 className={adminStyles.panelTitle}>⚡ 빠른 작업</h3>
        <div className={adminStyles.actionButtons}>
          <Link to="/moderation" className={styles.button}>
            ⚖️ 모더레이션 큐
          </Link>
          <Link to="/admin/users" className={styles.buttonGhost}>
            👥 사용자 관리
          </Link>
          <Link to="/admin/reports" className={styles.buttonGhost}>
            📋 신고 관리
          </Link>
          <Link to="/admin/settings" className={styles.buttonGhost}>
            ⚙️ 시스템 설정
          </Link>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users }: { users: typeof recentUsers }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  return (
    <div className={adminStyles.usersPanel}>
      {/* 필터 */}
      <div className={adminStyles.filtersBar}>
        <input
          type="text"
          placeholder="사용자 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.input}
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className={styles.input}
        >
          <option value="all">모든 역할</option>
          <option value="newbie">신규 회원</option>
          <option value="intermediate">중급 회원</option>
          <option value="advanced">고급 회원</option>
          <option value="subadmin">준운영진</option>
        </select>
      </div>

      {/* 사용자 목록 */}
      <div className={adminStyles.usersTable}>
        <div className={adminStyles.tableHeader}>
          <div className={adminStyles.tableCell}>사용자</div>
          <div className={adminStyles.tableCell}>이메일</div>
          <div className={adminStyles.tableCell}>역할</div>
          <div className={adminStyles.tableCell}>가입일</div>
          <div className={adminStyles.tableCell}>상태</div>
          <div className={adminStyles.tableCell}>작업</div>
        </div>
        {users.map(user => (
          <div key={user.id} className={adminStyles.tableRow}>
            <div className={adminStyles.tableCell}>
              <div className={adminStyles.userInfo}>
                <div className={adminStyles.userAvatar}>{user.name[0]}</div>
                <div>
                  <div className={adminStyles.userName}>{user.name}</div>
                  <div className={adminStyles.userNickname}>@{user.nickname}</div>
                </div>
              </div>
            </div>
            <div className={adminStyles.tableCell}>{user.email}</div>
            <div className={adminStyles.tableCell}>
              <span className={adminStyles.roleBadge}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            <div className={adminStyles.tableCell}>{user.joinedAt}</div>
            <div className={adminStyles.tableCell}>
              <span className={`${adminStyles.statusBadge} ${adminStyles[`status${user.status.charAt(0).toUpperCase() + user.status.slice(1)}`]}`}>
                {getStatusLabel(user.status)}
              </span>
            </div>
            <div className={adminStyles.tableCell}>
              <div className={adminStyles.actionButtons}>
                <button className={styles.buttonGhost} style={{ padding: '4px 8px', fontSize: '12px' }}>
                  편집
                </button>
                <button className={styles.buttonDanger} style={{ padding: '4px 8px', fontSize: '12px' }}>
                  차단
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentTab({ content }: { content: typeof recentContent }) {
  return (
    <div className={adminStyles.contentPanel}>
      <div className={adminStyles.contentStats}>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>📝</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>34</div>
            <div className={adminStyles.statLabel}>승인 대기</div>
          </div>
        </div>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>✅</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>89</div>
            <div className={adminStyles.statLabel}>오늘 승인</div>
          </div>
        </div>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>❌</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>15</div>
            <div className={adminStyles.statLabel}>거부됨</div>
          </div>
        </div>
      </div>

      <div className={adminStyles.contentList}>
        <h3 className={adminStyles.panelTitle}>📋 최근 콘텐츠</h3>
        {content.map(item => (
          <div key={item.id} className={adminStyles.contentItem}>
            <div className={adminStyles.contentInfo}>
              <div className={adminStyles.contentTitle}>{item.title}</div>
              <div className={adminStyles.contentMeta}>
                <span>{item.author}</span>
                <span>•</span>
                <span>{item.type === 'create' ? '생성' : '편집'}</span>
                <span>•</span>
                <span>{item.time}</span>
              </div>
            </div>
            <div className={adminStyles.contentStatus}>
              <span className={`${adminStyles.statusBadge} ${adminStyles[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}>
                {getContentStatusLabel(item.status)}
              </span>
            </div>
            <div className={adminStyles.contentActions}>
              <button className={styles.buttonGhost} style={{ padding: '4px 8px', fontSize: '12px' }}>
                보기
              </button>
              {item.status === 'pending' && (
                <>
                  <button className={styles.button} style={{ padding: '4px 8px', fontSize: '12px' }}>
                    승인
                  </button>
                  <button className={styles.buttonDanger} style={{ padding: '4px 8px', fontSize: '12px' }}>
                    거부
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemTab({ stats }: { stats: typeof dashboardStats.system }) {
  return (
    <div className={adminStyles.systemPanel}>
      <div className={adminStyles.systemStats}>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>🟢</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>{stats.serverStatus}</div>
            <div className={adminStyles.statLabel}>서버 상태</div>
          </div>
        </div>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>🔗</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>{stats.dbConnections}</div>
            <div className={adminStyles.statLabel}>DB 연결</div>
          </div>
        </div>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>⚡</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>{stats.responseTime}</div>
            <div className={adminStyles.statLabel}>응답시간</div>
          </div>
        </div>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statIcon}>⏰</div>
          <div className={adminStyles.statContent}>
            <div className={adminStyles.statNumber}>{stats.uptime}</div>
            <div className={adminStyles.statLabel}>가동률</div>
          </div>
        </div>
      </div>

      <div className={adminStyles.systemActions}>
        <h3 className={adminStyles.panelTitle}>🛠️ 시스템 관리</h3>
        <div className={adminStyles.actionGrid}>
          <button className={styles.button}>
            🔄 캐시 초기화
          </button>
          <button className={styles.button}>
            📊 로그 분석
          </button>
          <button className={styles.buttonGhost}>
            💾 백업 실행
          </button>
          <button className={styles.buttonGhost}>
            🔧 설정 관리
          </button>
        </div>
      </div>
    </div>
  );
}

function getRoleLabel(role: string): string {
  const labels = {
    newbie: '🔰 신규',
    intermediate: '📚 중급',
    advanced: '⭐ 고급',
    subadmin: '👑 준운영진'
  };
  return labels[role as keyof typeof labels] || role;
}

function getStatusLabel(status: string): string {
  const labels = {
    active: '활성',
    pending: '대기',
    blocked: '차단'
  };
  return labels[status as keyof typeof labels] || status;
}

function getContentStatusLabel(status: string): string {
  const labels = {
    approved: '승인됨',
    pending: '대기중',
    rejected: '거부됨'
  };
  return labels[status as keyof typeof labels] || status;
}
