import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { listCategoryGroups, type CategoryGroup } from '@/features/categories/services/categoryService';
import styles from '@/features/common/styles/ui.module.css';
import sidebarStyles from '@/features/layout/styles/sidebar.module.css';
import newStyles from '@/features/layout/styles/sidebar-new.module.css';

const categories = [
  {
    title: '📚 인문학',
    items: [
      { name: '철학', slug: 'philosophy', count: 42 },
      { name: '역사', slug: 'history', count: 156 },
      { name: '문학', slug: 'literature', count: 89 },
      { name: '언어학', slug: 'linguistics', count: 34 }
    ]
  },
  {
    title: '🔬 과학기술',
    items: [
      { name: '물리학', slug: 'physics', count: 78 },
      { name: '화학', slug: 'chemistry', count: 65 },
      { name: '생물학', slug: 'biology', count: 92 },
      { name: '컴퓨터과학', slug: 'computer-science', count: 234 }
    ]
  },
  {
    title: '🎨 문화예술',
    items: [
      { name: '음악', slug: 'music', count: 167 },
      { name: '영화', slug: 'movies', count: 298 },
      { name: '미술', slug: 'art', count: 123 },
      { name: '게임', slug: 'games', count: 445 }
    ]
  },
  {
    title: '🌏 사회',
    items: [
      { name: '정치', slug: 'politics', count: 89 },
      { name: '경제', slug: 'economy', count: 67 },
      { name: '사회', slug: 'society', count: 134 },
      { name: '법률', slug: 'law', count: 56 }
    ]
  },
  {
    title: '🏃 스포츠',
    items: [
      { name: '축구', slug: 'football', count: 178 },
      { name: '야구', slug: 'baseball', count: 145 },
      { name: '농구', slug: 'basketball', count: 89 },
      { name: '올림픽', slug: 'olympics', count: 67 }
    ]
  }
];

// 🎮 AI 챗봇 컴포넌트
interface ChatMessage {
  type: 'bot' | 'user';
  text: string;
}

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: 'bot', text: '안녕하세요! 위키 도우미 AI입니다. 무엇을 도와드릴까요?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    // 간단한 AI 응답 시뮬레이션
    setTimeout(() => {
      const responses = [
        '그 주제에 대해 관련 문서들을 찾아보겠습니다!',
        '흥미로운 질문이네요. 더 자세한 정보가 필요하시면 해당 문서를 편집해보세요.',
        '좋은 아이디어입니다! 새로운 문서를 작성해보는 것은 어떨까요?',
        '관련된 다른 주제들도 함께 살펴보시면 도움이 될 것 같아요.'
      ];
      const botMessage: ChatMessage = { type: 'bot', text: responses[Math.floor(Math.random() * responses.length)] };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
    
    setInput('');
  };

  return (
    <div className={newStyles.aiAssistant}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={newStyles.aiToggle}
      >
        🤖 AI 위키 도우미 {isOpen ? '▼' : '▶'}
      </button>
      
      {isOpen && (
        <div className={newStyles.aiChat}>
          <div className={newStyles.aiMessages}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${newStyles.aiMessage} ${newStyles[msg.type]}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className={newStyles.aiInput}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="질문을 입력하세요..."
              className={styles.input}
            />
            <button onClick={handleSend} className={styles.button}>전송</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎯 스마트 추천 시스템
interface Recommendation {
  title: string;
  reason: string;
  confidence: number;
}

function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    // 사용자 행동 기반 추천 시뮬레이션
    const smartRecs = [
      { title: '양자컴퓨팅의 미래', reason: '최근 물리학 문서를 많이 보셨네요!', confidence: 94 },
      { title: 'K-POP의 글로벌 영향', reason: '음악 카테고리 관심도 높음', confidence: 87 },
      { title: '블록체인 기술 원리', reason: '컴퓨터과학 편집 이력 기반', confidence: 92 }
    ];
    setRecommendations(smartRecs);
  }, []);

  return (
    <div className={newStyles.smartRecs}>
      <h3 className={sidebarStyles.sectionTitle}>🎯 맞춤 추천</h3>
      {recommendations.map((rec, idx) => (
        <div key={idx} className={newStyles.recItem}>
          <div className={newStyles.recTitle}>{rec.title}</div>
          <div className={newStyles.recReason}>{rec.reason}</div>
          <div className={newStyles.recConfidence}>정확도: {rec.confidence}%</div>
        </div>
      ))}
    </div>
  );
}

// 🌟 실시간 위키 이벤트
interface WikiEvent {
  type: string;
  user: string;
  doc: string;
  time: string;
  action: string;
}

function LiveWikiEvents() {
  const [events, setEvents] = useState<WikiEvent[]>([]);

  useEffect(() => {
    const liveEvents = [
      { type: 'edit', user: '고급위키러', doc: '인공지능', time: '2분 전', action: '새로운 섹션 추가' },
      { type: 'create', user: '중급위키러', doc: '메타버스 기술', time: '5분 전', action: '문서 생성' },
      { type: 'discuss', user: '신규위키러', doc: '기후변화', time: '8분 전', action: '토론 시작' },
      { type: 'approve', user: '준운영진', doc: '우주탐사', time: '12분 전', action: '편집 승인' }
    ];
    setEvents(liveEvents);

    // 실시간 업데이트 시뮬레이션
    const interval = setInterval(() => {
      const newEvent = {
        type: ['edit', 'create', 'discuss', 'approve'][Math.floor(Math.random() * 4)],
        user: ['익명위키러', '전문가', '학생', '연구원'][Math.floor(Math.random() * 4)],
        doc: ['AI윤리', '우주물리학', '한국사', '생명과학'][Math.floor(Math.random() * 4)],
        time: '방금 전',
        action: '활동 중'
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 3)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'edit': return '✏️';
      case 'create': return '📝';
      case 'discuss': return '💬';
      case 'approve': return '✅';
      default: return '📊';
    }
  };

  return (
    <div className={newStyles.liveEvents}>
      <h3 className={sidebarStyles.sectionTitle}>🌟 실시간 활동</h3>
      {events.map((event, idx) => (
        <div key={idx} className={newStyles.eventItem}>
          <span className={newStyles.eventIcon}>{getEventIcon(event.type)}</span>
          <div className={newStyles.eventContent}>
            <div className={newStyles.eventText}>
              <strong>{event.user}</strong>님이 <em>{event.doc}</em>에서 {event.action}
            </div>
            <div className={newStyles.eventTime}>{event.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 🎨 테마 커스터마이저
function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  const themes = [
    { name: 'dark', label: '🌙 다크모드', colors: ['#0f1419', '#00a495'] },
    { name: 'light', label: '☀️ 라이트모드', colors: ['#ffffff', '#007acc'] },
    { name: 'neon', label: '🌈 네온모드', colors: ['#000014', '#ff006e'] },
    { name: 'nature', label: '🌿 자연모드', colors: ['#1a3a1a', '#4caf50'] },
    { name: 'ocean', label: '🌊 바다모드', colors: ['#001122', '#00bcd4'] }
  ];

  const applyTheme = (themeName: string) => {
    setTheme(themeName);
    const selectedTheme = themes.find(t => t.name === themeName);
    if (selectedTheme) {
      document.documentElement.style.setProperty('--color-background', selectedTheme.colors[0]);
      document.documentElement.style.setProperty('--color-primary', selectedTheme.colors[1]);
    }
  };

  return (
    <div className={newStyles.themeCustomizer}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={newStyles.themeToggle}
      >
        🎨 테마 설정 {isOpen ? '▼' : '▶'}
      </button>
      
      {isOpen && (
        <div className={newStyles.themeOptions}>
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => applyTheme(t.name)}
              className={`${newStyles.themeOption} ${theme === t.name ? newStyles.active : ''}`}
            >
              {t.label}
              <div className={newStyles.colorPreview}>
                <span style={{ backgroundColor: t.colors[0] }}></span>
                <span style={{ backgroundColor: t.colors[1] }}></span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 🎵 집중 모드 & 백색소음
function FocusMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundType, setSoundType] = useState('rain');

  const sounds = [
    { type: 'rain', label: '🌧️ 빗소리', description: '집중력 향상' },
    { type: 'forest', label: '🌲 숲속소리', description: '마음의 평화' },
    { type: 'ocean', label: '🌊 파도소리', description: '스트레스 해소' },
    { type: 'cafe', label: '☕ 카페소음', description: '창의력 증진' }
  ];

  return (
    <div className={newStyles.focusMode}>
      <h3 className={sidebarStyles.sectionTitle}>🎵 집중 모드</h3>
      
      <div className={newStyles.soundSelector}>
        {sounds.map((sound) => (
          <button
            key={sound.type}
            onClick={() => setSoundType(sound.type)}
            className={`${newStyles.soundOption} ${soundType === sound.type ? newStyles.active : ''}`}
          >
            <div className={newStyles.soundLabel}>{sound.label}</div>
            <div className={newStyles.soundDesc}>{sound.description}</div>
          </button>
        ))}
      </div>
      
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`${styles.button} ${isPlaying ? newStyles.playing : ''}`}
      >
        {isPlaying ? '⏸️ 일시정지' : '▶️ 재생'}
      </button>
      
      {isPlaying && (
        <div className={newStyles.playingInfo}>
          <div className={newStyles.waveform}>🎵 ～～～～～</div>
          <div className={newStyles.playingText}>
            {sounds.find(s => s.type === soundType)?.label} 재생 중
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [groups, setGroups] = useState<CategoryGroup[] | null>(null);
  useEffect(() => {
    if (import.meta.env.DEV) return;
    void (async () => {
      try {
        const data = await listCategoryGroups();
        setGroups(data);
      } catch {
        setGroups([]);
      }
    })();
  }, []);

  return (
    <aside className={sidebarStyles.sidebar} role="complementary" aria-label="사이드바 네비게이션">
      {/* 카테고리: 프로덕션에서는 Firestore에서 로드, 개발에서는 샘플 노출 */}
      {(!import.meta.env.DEV && groups && groups.length > 0) && (
        <nav className={sidebarStyles.categoriesSection} aria-label="카테고리 메뉴">
          <h2 className={sidebarStyles.sectionTitle}><span aria-hidden="true">📂</span> 카테고리</h2>
          {groups.map((category) => (
            <div key={category.id} className={sidebarStyles.categoryGroup}>
              <h3 className={sidebarStyles.categoryTitle}>{category.title}</h3>
              <ul className={sidebarStyles.categoryList}>
                {category.items.map((item) => (
                  <li key={item.slug} className={sidebarStyles.categoryItem}>
                    <Link to={`/wiki/${item.slug}`} className={sidebarStyles.categoryLink}>
                      {item.name}
                      {typeof item.count === 'number' && (
                        <span className={sidebarStyles.categoryCount}>{item.count}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}

      {/* 기존 카테고리 (개발 환경에서만 노출: 샘플 데이터) */}
      {import.meta.env.DEV && (
        <div className={sidebarStyles.categoriesSection}>
          <h2 className={sidebarStyles.sectionTitle}>📂 카테고리</h2>
          {categories.map(category => (
            <div key={category.title} className={sidebarStyles.categoryGroup}>
              <h3 className={sidebarStyles.categoryTitle}>{category.title}</h3>
              <ul className={sidebarStyles.categoryList}>
                {category.items.map(item => (
                  <li key={item.slug} className={sidebarStyles.categoryItem}>
                    <Link to={`/wiki/${item.slug}`} className={sidebarStyles.categoryLink}>
                      {item.name}
                      <span className={sidebarStyles.categoryCount}>{item.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* 🤖 AI 위키 도우미 (개발 전용 데모) */}
      {import.meta.env.DEV && <AIAssistant />}

      {/* 🎯 스마트 추천 시스템 (개발 전용 데모) */}
      {import.meta.env.DEV && <SmartRecommendations />}

      {/* 🌟 실시간 위키 이벤트 (개발 전용 데모) */}
      {import.meta.env.DEV && <LiveWikiEvents />}

      {/* 🎨 테마 커스터마이저 (개발 전용 데모) */}
      {import.meta.env.DEV && <ThemeCustomizer />}

      {/* 🎵 집중 모드 & 백색소음 (개발 전용 데모) */}
      {import.meta.env.DEV && <FocusMode />}

      {/* 🚀 위키 터보 모드 (개발 전용 데모) */}
      {import.meta.env.DEV && (
        <div className={newStyles.turboMode}>
          <h3 className={sidebarStyles.sectionTitle}>🚀 위키 터보</h3>
          <div className={newStyles.turboStats}>
            <div className={newStyles.turboItem}>
              <span className={newStyles.turboIcon}>⚡</span>
              <div>
                <div className={newStyles.turboLabel}>편집 속도</div>
                <div className={newStyles.turboValue}>127% 향상</div>
              </div>
            </div>
            <div className={newStyles.turboItem}>
              <span className={newStyles.turboIcon}>🧠</span>
              <div>
                <div className={newStyles.turboLabel}>집중도</div>
                <div className={newStyles.turboValue}>89% 최적</div>
              </div>
            </div>
          </div>
          <button className={`${styles.button} ${newStyles.turboButton}`}>
            터보 모드 활성화
          </button>
        </div>
      )}
    </aside>
  );
}