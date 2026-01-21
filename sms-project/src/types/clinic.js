/**
 * 한의원 영업 타겟 데이터 타입 정의
 */

// 퍼널 단계
export const FUNNEL_STAGES = {
  CONTACT: '컨택',
  WONTANG_CONTRACT: '원탕계약완료',
  LEANDIET_CONTRACT: '린다이어트계약완료',
  REVENUE: '매출'
};

// 퍼널 단계 순서 (인덱스로 진행도 계산)
export const FUNNEL_ORDER = [
  FUNNEL_STAGES.CONTACT,
  FUNNEL_STAGES.WONTANG_CONTRACT,
  FUNNEL_STAGES.LEANDIET_CONTRACT,
  FUNNEL_STAGES.REVENUE
];

// 퍼널 단계별 색상
export const FUNNEL_COLORS = {
  [FUNNEL_STAGES.CONTACT]: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  [FUNNEL_STAGES.WONTANG_CONTRACT]: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  [FUNNEL_STAGES.LEANDIET_CONTRACT]: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
  [FUNNEL_STAGES.REVENUE]: { bg: '#ede9fe', text: '#5b21b6', border: '#8b5cf6' }
};

// 중요도
export const PRIORITY_LEVELS = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D'
};

// 중요도별 색상
export const PRIORITY_COLORS = {
  A: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  B: { bg: '#ffedd5', text: '#9a3412', border: '#f97316' },
  C: { bg: '#fef9c3', text: '#854d0e', border: '#eab308' },
  D: { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' }
};

// 지역 목록
export const REGIONS = [
  '서울',
  '경기',
  '인천',
  '부산',
  '대구',
  '광주',
  '대전',
  '울산',
  '세종',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주'
];

/**
 * 한의원 데이터 타입
 * @typedef {Object} Clinic
 * @property {string} cid - 한의원 고유번호 (Primary Key)
 * @property {string} clinicName - 한의원명
 * @property {string} directorName - 원장명
 * @property {string} phone - 연락처
 * @property {string} region - 지역
 * @property {'A'|'B'|'C'|'D'} priority - 중요도
 * @property {string} funnelStage - 현재 퍼널 단계
 * @property {string} assignee - 담당자
 * @property {string} lastContactDate - 마지막 컨택일
 * @property {string} nextActionPlan - 다음 액션 플랜
 * @property {string} nextActionDate - 다음 액션 예정일
 * @property {Array<HistoryEntry>} history - 히스토리
 * @property {boolean} isLeanTarget - 린 영업대상 여부
 * @property {boolean} hasManagementSession - 경영세션 여부
 * @property {boolean} usesSooMembers - 수멤버스 사용 여부
 * @property {boolean} hasOpeningSession - 개원세션 여부
 * @property {string} createdAt - 생성일
 * @property {string} updatedAt - 수정일
 */

/**
 * 히스토리 엔트리 타입
 * @typedef {Object} HistoryEntry
 * @property {string} id - 히스토리 ID
 * @property {string} date - 날짜
 * @property {string} content - 내용
 * @property {string} author - 작성자
 */

// 기본 한의원 객체 생성 함수
export const createDefaultClinic = (overrides = {}) => ({
  cid: '',
  clinicName: '',
  directorName: '',
  phone: '',
  region: '',
  priority: PRIORITY_LEVELS.C,
  funnelStage: FUNNEL_STAGES.CONTACT,
  assignee: '',
  lastContactDate: '',
  nextActionPlan: '',
  nextActionDate: '',
  history: [],
  isLeanTarget: false,
  hasManagementSession: false,
  usesSooMembers: false,
  hasOpeningSession: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

// 다음 액션 기한이 임박했는지 확인 (3일 이내)
export const isActionUrgent = (nextActionDate) => {
  if (!nextActionDate) return false;
  const today = new Date();
  const actionDate = new Date(nextActionDate);
  const diffDays = Math.ceil((actionDate - today) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
};

// 다음 액션 기한이 지났는지 확인
export const isActionOverdue = (nextActionDate) => {
  if (!nextActionDate) return false;
  const today = new Date();
  const actionDate = new Date(nextActionDate);
  return actionDate < today;
};
