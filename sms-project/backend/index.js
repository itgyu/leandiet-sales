import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-jwt-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Mock users database (passwords are plain text for simplicity)
const users = [
  {
    id: 'user1',
    email: 'admin@example.com',
    password: 'password123',
    name: '관리자',
    role: 'ADMIN'
  },
  {
    id: 'user2',
    email: 'user1@example.com',
    password: 'password123',
    name: '일반 사용자',
    role: 'USER'
  },
  {
    id: 'admin1',
    email: 'admin@leandiet.co.kr',
    password: 'leandiet1!',
    name: '린다이어트 관리자',
    role: 'ADMIN'
  },
  {
    id: 'medistream1',
    email: 'taegyu.lee@medistream.co.kr',
    password: 'asdf12345!',
    name: '이태규',
    role: 'ADMIN'
  },
  {
    id: 'medistream2',
    email: 'ilnyeong.cho@medistream.co.kr',
    password: 'asdf12345!',
    name: '조일녕',
    role: 'ADMIN'
  },
  {
    id: 'medistream3',
    email: 'jongeon.na@medistream.co.kr',
    password: 'asdf12345!',
    name: '나종언',
    role: 'ADMIN'
  }
];

// Mock stores database (레거시 - 기존 호환성 유지)
const stores = [
  {
    id: '1',
    name: '토스트 카페',
    address: '서울시 강남구 역삼동 123-45',
    phone: '02-1234-5678',
    status: 'SIGNUP_COMPLETED',
    ownerId: 'user1',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

// === 한의원 영업 타겟 데이터베이스 ===
const FUNNEL_STAGES = {
  CONTACT: '컨택',
  WONTANG_CONTRACT: '원탕계약완료',
  LEANDIET_CONTRACT: '린다이어트계약완료',
  REVENUE: '매출'
};

const clinics = [
  {
    cid: 'clinic001',
    clinicName: '강남 한의원',
    directorName: '김한의',
    phone: '02-1234-5678',
    region: '서울',
    priority: 'A',
    funnelStage: FUNNEL_STAGES.REVENUE,
    assignee: '이태규',
    lastContactDate: '2025-01-15',
    nextActionPlan: '월간 매출 리뷰 미팅',
    nextActionDate: '2025-01-25',
    history: [
      { id: 'h1', date: '2024-10-01', content: '첫 컨택 - 관심 표명', author: '이태규' },
      { id: 'h2', date: '2024-11-15', content: '원탕 계약 완료', author: '이태규' },
      { id: 'h3', date: '2024-12-20', content: '린다이어트 계약 완료', author: '이태규' },
      { id: 'h4', date: '2025-01-10', content: '첫 매출 발생 - 500만원', author: '이태규' }
    ],
    isLeanTarget: true,
    hasManagementSession: true,
    usesSooMembers: true,
    hasOpeningSession: false,
    createdAt: '2024-10-01T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z'
  },
  {
    cid: 'clinic002',
    clinicName: '서초 한의원',
    directorName: '박원장',
    phone: '02-2345-6789',
    region: '서울',
    priority: 'A',
    funnelStage: FUNNEL_STAGES.LEANDIET_CONTRACT,
    assignee: '조일녕',
    lastContactDate: '2025-01-18',
    nextActionPlan: '설치 일정 협의',
    nextActionDate: '2025-01-22',
    history: [
      { id: 'h1', date: '2024-11-01', content: '첫 컨택', author: '조일녕' },
      { id: 'h2', date: '2024-12-10', content: '원탕 계약', author: '조일녕' },
      { id: 'h3', date: '2025-01-18', content: '린다이어트 계약 완료', author: '조일녕' }
    ],
    isLeanTarget: true,
    hasManagementSession: true,
    usesSooMembers: false,
    hasOpeningSession: true,
    createdAt: '2024-11-01T00:00:00.000Z',
    updatedAt: '2025-01-18T00:00:00.000Z'
  },
  {
    cid: 'clinic003',
    clinicName: '부산 해운대 한의원',
    directorName: '이원장',
    phone: '051-1234-5678',
    region: '부산',
    priority: 'B',
    funnelStage: FUNNEL_STAGES.WONTANG_CONTRACT,
    assignee: '나종언',
    lastContactDate: '2025-01-10',
    nextActionPlan: '린다이어트 소개 미팅',
    nextActionDate: '2025-01-20',
    history: [
      { id: 'h1', date: '2024-12-01', content: '첫 컨택 - 지인 소개', author: '나종언' },
      { id: 'h2', date: '2025-01-05', content: '원탕 계약 완료', author: '나종언' }
    ],
    isLeanTarget: true,
    hasManagementSession: false,
    usesSooMembers: true,
    hasOpeningSession: false,
    createdAt: '2024-12-01T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z'
  },
  {
    cid: 'clinic004',
    clinicName: '대구 수성 한의원',
    directorName: '최원장',
    phone: '053-2345-6789',
    region: '대구',
    priority: 'B',
    funnelStage: FUNNEL_STAGES.CONTACT,
    assignee: '이태규',
    lastContactDate: '2025-01-17',
    nextActionPlan: '제품 소개 자료 발송',
    nextActionDate: '2025-01-19',
    history: [
      { id: 'h1', date: '2025-01-17', content: '첫 컨택 - 홈페이지 유입', author: '이태규' }
    ],
    isLeanTarget: false,
    hasManagementSession: false,
    usesSooMembers: false,
    hasOpeningSession: false,
    createdAt: '2025-01-17T00:00:00.000Z',
    updatedAt: '2025-01-17T00:00:00.000Z'
  },
  {
    cid: 'clinic005',
    clinicName: '인천 송도 한의원',
    directorName: '정원장',
    phone: '032-3456-7890',
    region: '인천',
    priority: 'C',
    funnelStage: FUNNEL_STAGES.CONTACT,
    assignee: '조일녕',
    lastContactDate: '2025-01-12',
    nextActionPlan: '팔로업 전화',
    nextActionDate: '2025-01-21',
    history: [
      { id: 'h1', date: '2025-01-12', content: '콜드콜 - 관심 없음 표명, 재컨택 예정', author: '조일녕' }
    ],
    isLeanTarget: false,
    hasManagementSession: false,
    usesSooMembers: false,
    hasOpeningSession: false,
    createdAt: '2025-01-12T00:00:00.000Z',
    updatedAt: '2025-01-12T00:00:00.000Z'
  },
  {
    cid: 'clinic006',
    clinicName: '광주 상무 한의원',
    directorName: '강원장',
    phone: '062-4567-8901',
    region: '광주',
    priority: 'A',
    funnelStage: FUNNEL_STAGES.REVENUE,
    assignee: '나종언',
    lastContactDate: '2025-01-14',
    nextActionPlan: '추가 서비스 제안',
    nextActionDate: '2025-01-28',
    history: [
      { id: 'h1', date: '2024-08-01', content: '첫 컨택', author: '나종언' },
      { id: 'h2', date: '2024-09-15', content: '원탕 계약', author: '나종언' },
      { id: 'h3', date: '2024-10-20', content: '린다이어트 계약', author: '나종언' },
      { id: 'h4', date: '2024-11-01', content: '매출 시작 - 300만원', author: '나종언' },
      { id: 'h5', date: '2025-01-14', content: '월 매출 800만원 달성', author: '나종언' }
    ],
    isLeanTarget: true,
    hasManagementSession: true,
    usesSooMembers: true,
    hasOpeningSession: true,
    createdAt: '2024-08-01T00:00:00.000Z',
    updatedAt: '2025-01-14T00:00:00.000Z'
  },
  {
    cid: 'clinic007',
    clinicName: '대전 둔산 한의원',
    directorName: '윤원장',
    phone: '042-5678-9012',
    region: '대전',
    priority: 'B',
    funnelStage: FUNNEL_STAGES.WONTANG_CONTRACT,
    assignee: '이태규',
    lastContactDate: '2025-01-16',
    nextActionPlan: '린다이어트 데모 시연',
    nextActionDate: '2025-01-23',
    history: [
      { id: 'h1', date: '2024-12-15', content: '첫 컨택 - 세미나 참석', author: '이태규' },
      { id: 'h2', date: '2025-01-08', content: '원탕 계약 완료', author: '이태규' }
    ],
    isLeanTarget: true,
    hasManagementSession: false,
    usesSooMembers: false,
    hasOpeningSession: false,
    createdAt: '2024-12-15T00:00:00.000Z',
    updatedAt: '2025-01-16T00:00:00.000Z'
  },
  {
    cid: 'clinic008',
    clinicName: '경기 분당 한의원',
    directorName: '임원장',
    phone: '031-6789-0123',
    region: '경기',
    priority: 'A',
    funnelStage: FUNNEL_STAGES.LEANDIET_CONTRACT,
    assignee: '조일녕',
    lastContactDate: '2025-01-19',
    nextActionPlan: '시스템 셋업 진행',
    nextActionDate: '2025-01-24',
    history: [
      { id: 'h1', date: '2024-10-20', content: '첫 컨택', author: '조일녕' },
      { id: 'h2', date: '2024-11-25', content: '원탕 계약', author: '조일녕' },
      { id: 'h3', date: '2025-01-19', content: '린다이어트 계약 완료!', author: '조일녕' }
    ],
    isLeanTarget: true,
    hasManagementSession: true,
    usesSooMembers: true,
    hasOpeningSession: false,
    createdAt: '2024-10-20T00:00:00.000Z',
    updatedAt: '2025-01-19T00:00:00.000Z'
  },
  {
    cid: 'clinic009',
    clinicName: '울산 남구 한의원',
    directorName: '한원장',
    phone: '052-7890-1234',
    region: '울산',
    priority: 'C',
    funnelStage: FUNNEL_STAGES.CONTACT,
    assignee: '나종언',
    lastContactDate: '2025-01-11',
    nextActionPlan: '이메일 자료 발송',
    nextActionDate: '2025-01-18',
    history: [
      { id: 'h1', date: '2025-01-11', content: '첫 컨택 - SNS 광고 유입', author: '나종언' }
    ],
    isLeanTarget: false,
    hasManagementSession: false,
    usesSooMembers: false,
    hasOpeningSession: false,
    createdAt: '2025-01-11T00:00:00.000Z',
    updatedAt: '2025-01-11T00:00:00.000Z'
  },
  {
    cid: 'clinic010',
    clinicName: '제주 연동 한의원',
    directorName: '오원장',
    phone: '064-8901-2345',
    region: '제주',
    priority: 'D',
    funnelStage: FUNNEL_STAGES.CONTACT,
    assignee: '이태규',
    lastContactDate: '2025-01-08',
    nextActionPlan: '재컨택 예정',
    nextActionDate: '2025-02-01',
    history: [
      { id: 'h1', date: '2025-01-08', content: '첫 컨택 - 시기상조, 2월 재연락 요청', author: '이태규' }
    ],
    isLeanTarget: false,
    hasManagementSession: false,
    usesSooMembers: false,
    hasOpeningSession: false,
    createdAt: '2025-01-08T00:00:00.000Z',
    updatedAt: '2025-01-08T00:00:00.000Z'
  }
];

// Data storage paths
const DATA_DIR = path.join(process.cwd(), 'data');
const CONSENT_LINKS_FILE = path.join(DATA_DIR, 'consent-links.json');
const CONSENT_RESPONSES_FILE = path.join(DATA_DIR, 'consent-responses.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load existing data or create empty files
const loadConsentLinks = () => {
  if (fs.existsSync(CONSENT_LINKS_FILE)) {
    try {
      const data = fs.readFileSync(CONSENT_LINKS_FILE, 'utf8');
      return new Map(Object.entries(JSON.parse(data)));
    } catch (error) {
      console.error('Error loading consent links:', error);
      return new Map();
    }
  }
  return new Map();
};

const loadConsentResponses = () => {
  if (fs.existsSync(CONSENT_RESPONSES_FILE)) {
    try {
      const data = fs.readFileSync(CONSENT_RESPONSES_FILE, 'utf8');
      return new Map(Object.entries(JSON.parse(data)));
    } catch (error) {
      console.error('Error loading consent responses:', error);
      return new Map();
    }
  }
  return new Map();
};

// Save data to files
const saveConsentLinks = (consentLinks) => {
  try {
    const data = Object.fromEntries(consentLinks);
    fs.writeFileSync(CONSENT_LINKS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving consent links:', error);
  }
};

const saveConsentResponses = (consentResponses) => {
  try {
    const data = Object.fromEntries(consentResponses);
    fs.writeFileSync(CONSENT_RESPONSES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving consent responses:', error);
  }
};

// Initialize data storage
let consentLinks = loadConsentLinks();
let consentResponses = loadConsentResponses();

// Helper function to generate consent link
const generateConsentLink = (storeId) => {
  // Check if store already has an active link
  const existingLink = Array.from(consentLinks.values())
    .find(link => link.store_id === storeId && link.is_active);
  
  if (existingLink) {
    console.log(`📋 기존 링크 반환: ${existingLink.consent_url}`);
    return existingLink;
  }

  const token = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const linkData = {
    link_id: `link_${Date.now()}`,
    token: token,
    store_id: storeId,
    consent_url: `http://localhost:5173/consent/${token}`,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_active: true
  };
  
  consentLinks.set(token, linkData);
  saveConsentLinks(consentLinks);
  return linkData;
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    console.log('🔍 로그인 요청 데이터:', req.body);
    const { email, password } = req.body;
    console.log('🔍 추출된 데이터:', { email, password: password ? '***' : 'undefined' });

    if (!email || !password) {
      console.log('❌ 이메일 또는 비밀번호 누락');
      return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      console.log(`❌ 사용자를 찾을 수 없음: ${email}`);
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    console.log('🔍 사용자 정보:', { email: user.email, storedPassword: user.password, inputPassword: password });
    if (password !== user.password) {
      console.log('❌ 비밀번호 불일치');
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
});

// Get stores
app.get('/api/stores', authenticateToken, (req, res) => {
  try {
    // For admin users, return all stores
    // For regular users, return only their assigned stores
    let filteredStores = stores;
    
    if (req.user.role !== 'ADMIN') {
      filteredStores = stores.filter(store => store.ownerId === req.user.userId);
    }

    res.json(filteredStores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Get store by ID
app.get('/api/stores/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const store = stores.find(s => s.id === id);

    if (!store) {
      return res.status(404).json({ message: '한의원을 찾을 수 없습니다.' });
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && store.ownerId !== req.user.userId) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    res.json(store);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// === 한의원 영업 타겟 API ENDPOINTS ===

// Get all clinics with filters
app.get('/api/clinics', authenticateToken, (req, res) => {
  try {
    let filteredClinics = [...clinics];

    // Apply filters
    const { funnelStage, priority, assignee, region, isLeanTarget } = req.query;

    if (funnelStage) {
      filteredClinics = filteredClinics.filter(c => c.funnelStage === funnelStage);
    }
    if (priority) {
      filteredClinics = filteredClinics.filter(c => c.priority === priority);
    }
    if (assignee) {
      filteredClinics = filteredClinics.filter(c => c.assignee === assignee);
    }
    if (region) {
      filteredClinics = filteredClinics.filter(c => c.region === region);
    }
    if (isLeanTarget !== undefined) {
      filteredClinics = filteredClinics.filter(c => c.isLeanTarget === (isLeanTarget === 'true'));
    }

    res.json({ data: filteredClinics });
  } catch (error) {
    console.error('Get clinics error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Get clinic stats (퍼널 통계)
app.get('/api/clinics/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      total: clinics.length,
      byFunnel: {
        [FUNNEL_STAGES.CONTACT]: clinics.filter(c => c.funnelStage === FUNNEL_STAGES.CONTACT).length,
        [FUNNEL_STAGES.WONTANG_CONTRACT]: clinics.filter(c => c.funnelStage === FUNNEL_STAGES.WONTANG_CONTRACT).length,
        [FUNNEL_STAGES.LEANDIET_CONTRACT]: clinics.filter(c => c.funnelStage === FUNNEL_STAGES.LEANDIET_CONTRACT).length,
        [FUNNEL_STAGES.REVENUE]: clinics.filter(c => c.funnelStage === FUNNEL_STAGES.REVENUE).length
      },
      byPriority: {
        A: clinics.filter(c => c.priority === 'A').length,
        B: clinics.filter(c => c.priority === 'B').length,
        C: clinics.filter(c => c.priority === 'C').length,
        D: clinics.filter(c => c.priority === 'D').length
      },
      byAssignee: {},
      byRegion: {},
      leanTargetCount: clinics.filter(c => c.isLeanTarget).length
    };

    // Count by assignee
    clinics.forEach(c => {
      if (c.assignee) {
        stats.byAssignee[c.assignee] = (stats.byAssignee[c.assignee] || 0) + 1;
      }
    });

    // Count by region
    clinics.forEach(c => {
      if (c.region) {
        stats.byRegion[c.region] = (stats.byRegion[c.region] || 0) + 1;
      }
    });

    res.json({ data: stats });
  } catch (error) {
    console.error('Get clinic stats error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Get single clinic by ID
app.get('/api/clinics/:cid', authenticateToken, (req, res) => {
  try {
    const { cid } = req.params;
    const clinic = clinics.find(c => c.cid === cid);

    if (!clinic) {
      return res.status(404).json({ message: '한의원을 찾을 수 없습니다.' });
    }

    res.json({ data: clinic });
  } catch (error) {
    console.error('Get clinic error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Create new clinic
app.post('/api/clinics', authenticateToken, (req, res) => {
  try {
    const newClinic = {
      cid: `clinic${Date.now()}`,
      ...req.body,
      history: req.body.history || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    clinics.push(newClinic);

    console.log(`📝 새 한의원 등록: ${newClinic.clinicName}`);
    res.status(201).json({ data: newClinic });
  } catch (error) {
    console.error('Create clinic error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Update clinic
app.put('/api/clinics/:cid', authenticateToken, (req, res) => {
  try {
    const { cid } = req.params;
    const clinicIndex = clinics.findIndex(c => c.cid === cid);

    if (clinicIndex === -1) {
      return res.status(404).json({ message: '한의원을 찾을 수 없습니다.' });
    }

    clinics[clinicIndex] = {
      ...clinics[clinicIndex],
      ...req.body,
      cid, // Ensure cid doesn't change
      updatedAt: new Date().toISOString()
    };

    console.log(`✏️ 한의원 수정: ${clinics[clinicIndex].clinicName}`);
    res.json({ data: clinics[clinicIndex] });
  } catch (error) {
    console.error('Update clinic error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Update clinic toggle fields (토글 스위치용)
app.patch('/api/clinics/:cid/toggles', authenticateToken, (req, res) => {
  try {
    const { cid } = req.params;
    const { field, value } = req.body;

    const clinicIndex = clinics.findIndex(c => c.cid === cid);

    if (clinicIndex === -1) {
      return res.status(404).json({ message: '한의원을 찾을 수 없습니다.' });
    }

    const allowedFields = ['isLeanTarget', 'hasManagementSession', 'usesSooMembers', 'hasOpeningSession'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: '허용되지 않은 필드입니다.' });
    }

    clinics[clinicIndex][field] = value;
    clinics[clinicIndex].updatedAt = new Date().toISOString();

    console.log(`🔀 토글 변경: ${clinics[clinicIndex].clinicName} - ${field}: ${value}`);
    res.json({ data: clinics[clinicIndex] });
  } catch (error) {
    console.error('Toggle clinic field error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Add history entry to clinic
app.post('/api/clinics/:cid/history', authenticateToken, (req, res) => {
  try {
    const { cid } = req.params;
    const { content } = req.body;

    const clinicIndex = clinics.findIndex(c => c.cid === cid);

    if (clinicIndex === -1) {
      return res.status(404).json({ message: '한의원을 찾을 수 없습니다.' });
    }

    const newHistoryEntry = {
      id: `h${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      content,
      author: req.user.name || req.user.email
    };

    clinics[clinicIndex].history.push(newHistoryEntry);
    clinics[clinicIndex].lastContactDate = newHistoryEntry.date;
    clinics[clinicIndex].updatedAt = new Date().toISOString();

    console.log(`📋 히스토리 추가: ${clinics[clinicIndex].clinicName}`);
    res.json({ data: newHistoryEntry });
  } catch (error) {
    console.error('Add clinic history error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Update funnel stage
app.patch('/api/clinics/:cid/funnel', authenticateToken, (req, res) => {
  try {
    const { cid } = req.params;
    const { funnelStage } = req.body;

    const clinicIndex = clinics.findIndex(c => c.cid === cid);

    if (clinicIndex === -1) {
      return res.status(404).json({ message: '한의원을 찾을 수 없습니다.' });
    }

    const validStages = Object.values(FUNNEL_STAGES);
    if (!validStages.includes(funnelStage)) {
      return res.status(400).json({ message: '유효하지 않은 퍼널 단계입니다.' });
    }

    const oldStage = clinics[clinicIndex].funnelStage;
    clinics[clinicIndex].funnelStage = funnelStage;
    clinics[clinicIndex].updatedAt = new Date().toISOString();

    // Add auto history entry
    const historyEntry = {
      id: `h${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      content: `퍼널 단계 변경: ${oldStage} → ${funnelStage}`,
      author: req.user.name || req.user.email
    };
    clinics[clinicIndex].history.push(historyEntry);

    console.log(`🔄 퍼널 변경: ${clinics[clinicIndex].clinicName} - ${oldStage} → ${funnelStage}`);
    res.json({ data: clinics[clinicIndex] });
  } catch (error) {
    console.error('Update funnel stage error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Delete clinic
app.delete('/api/clinics/:cid', authenticateToken, (req, res) => {
  try {
    const { cid } = req.params;
    const clinicIndex = clinics.findIndex(c => c.cid === cid);

    if (clinicIndex === -1) {
      return res.status(404).json({ message: '한의원을 찾을 수 없습니다.' });
    }

    const deletedClinic = clinics.splice(clinicIndex, 1)[0];

    console.log(`🗑️ 한의원 삭제: ${deletedClinic.clinicName}`);
    res.json({ message: '삭제되었습니다.', data: deletedClinic });
  } catch (error) {
    console.error('Delete clinic error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Get assignees list
app.get('/api/assignees', authenticateToken, (req, res) => {
  try {
    const assignees = [...new Set(clinics.map(c => c.assignee).filter(Boolean))];
    res.json({ data: assignees });
  } catch (error) {
    console.error('Get assignees error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// === CONSENT FORM API ENDPOINTS ===

// Create consent link (Admin only)
app.post('/api/consent/create-link', authenticateToken, (req, res) => {
  try {
    const { storeId } = req.body;
    
    if (!storeId) {
      return res.status(400).json({ message: '한의원 ID가 필요합니다.' });
    }

    // Check if store exists
    const store = stores.find(s => s.id === storeId);
    if (!store) {
      return res.status(404).json({ message: '한의원을 찾을 수 없습니다.' });
    }

    // Generate consent link
    const linkData = generateConsentLink(storeId);
    
    console.log(`📝 동의서 링크 생성됨: ${linkData.consent_url}`);
    
    res.json({
      data: {
        link_id: linkData.link_id,
        token: linkData.token,
        consent_url: linkData.consent_url,
        expires_at: linkData.expires_at,
        message: "링크를 복사해서 고객에게 전달하세요"
      }
    });

  } catch (error) {
    console.error('Create consent link error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Get consent form data by storeId (Public - no auth required)  
app.get('/api/consent/form/:storeId', (req, res) => {
  try {
    const { storeId } = req.params;
    
    if (!storeId) {
      return res.status(400).json({ success: false, message: '한의원 ID가 필요합니다.' });
    }

    // Find store data
    const store = stores.find(s => s.id === storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: '한의원 정보를 찾을 수 없습니다.' });
    }

    // Check if there's an existing consent response for this store
    const existingResponses = Array.from(consentResponses.values())
      .filter(response => response.store_id === storeId)
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    
    const latestResponse = existingResponses[0]; // Get the most recent response

    const formData = {
      link_id: `link_${storeId}`,
      token: storeId,
      store_name: store.name,
      store_phone: store.phone,
      owner_name: "김영업", // Mock owner name
      form_fields: latestResponse ? {
        respondent_name: latestResponse.respondent_name || "",
        respondent_phone: latestResponse.respondent_phone || "",
        respondent_position: latestResponse.respondent_position || "",
        remote_install_date: latestResponse.remote_install_date || "",
        remote_install_time: latestResponse.remote_install_time || "",
        table_count: latestResponse.table_count || "",
        sticker_type: latestResponse.sticker_type || "",
        design_type: latestResponse.design_type || "",
        preferred_color: latestResponse.preferred_color || "",
        terms_agreement: false // Always reset this for new submissions
      } : {
        respondent_name: "",
        respondent_phone: "",
        respondent_position: "",
        remote_install_date: "",
        remote_install_time: "",
        table_count: "",
        sticker_type: "",
        design_type: "",
        preferred_color: "",
        terms_agreement: false
      },
      has_existing_data: !!latestResponse,
      last_submitted_at: latestResponse ? latestResponse.submitted_at : null
    };

    console.log(`📖 동의서 폼 조회 (storeId): ${storeId} - ${store.name}${latestResponse ? ' (기존 데이터 포함)' : ''}`);
    
    res.json({ success: true, data: formData });

  } catch (error) {
    console.error('Get consent form error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// Get consent form data by token (Public - no auth required) - Legacy support
app.get('/api/consent/form/token/:token', (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: '토큰이 필요합니다.' });
    }

    // Find consent link
    const linkData = consentLinks.get(token);
    if (!linkData) {
      return res.status(404).json({ message: '유효하지 않거나 만료된 링크입니다.' });
    }

    // Check if expired
    if (new Date() > new Date(linkData.expires_at)) {
      return res.status(410).json({ message: '만료된 링크입니다.' });
    }

    // Find store data
    const store = stores.find(s => s.id === linkData.store_id);
    if (!store) {
      return res.status(404).json({ message: '한의원 정보를 찾을 수 없습니다.' });
    }

    const formData = {
      link_id: linkData.link_id,
      token: linkData.token,
      store_name: store.name,
      store_phone: store.phone,
      owner_name: "김영업", // Mock owner name
      form_fields: {
        respondent_name: "",
        respondent_phone: "",
        respondent_position: "",
        remote_install_date: "",
        table_count: "",
        sticker_type: "",
        design_type: "",
        preferred_color: "",
        terms_agreement: false
      }
    };

    console.log(`📖 동의서 폼 조회: ${token}`);
    
    res.json({ data: formData });

  } catch (error) {
    console.error('Get consent form error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Submit consent form (Public - no auth required)
app.post('/api/consent/submit', (req, res) => {
  try {
    const { token, store_id, ...formData } = req.body;
    
    // token과 store_id 중 하나를 사용 (고정 URL 방식에서는 token이 storeId)
    const storeIdToUse = token || store_id;
    
    if (!storeIdToUse) {
      return res.status(400).json({ success: false, message: '한의원 ID가 필요합니다.' });
    }

    // Find store data
    const store = stores.find(s => s.id === storeIdToUse);
    if (!store) {
      return res.status(404).json({ success: false, message: '한의원 정보를 찾을 수 없습니다.' });
    }

    // Validate required fields
    const requiredFields = [
      'respondent_name',
      'respondent_phone', 
      'respondent_position',
      'remote_install_date',
      'remote_install_time',
      'table_count',
      'sticker_type',
      'design_type',
      'terms_agreement'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field] === '') {
        return res.status(400).json({ success: false, message: `${field} 필드가 필요합니다.` });
      }
    }

    // Create response record
    const responseId = `response_${Date.now()}`;
    const responseData = {
      response_id: responseId,
      link_id: `link_${storeIdToUse}`,
      token: storeIdToUse,
      store_id: storeIdToUse,
      ...formData,
      submitted_at: new Date().toISOString()
    };

    // Store response
    consentResponses.set(responseId, responseData);
    saveConsentResponses(consentResponses);

    console.log(`✅ 동의서 제출 완료: ${responseId}`, {
      store_id: storeIdToUse,
      store_name: store.name,
      respondent: formData.respondent_name,
      phone: formData.respondent_phone
    });

    res.json({
      success: true,
      data: {
        response_id: responseId,
        submitted_at: responseData.submitted_at
      }
    });

  } catch (error) {
    console.error('Submit consent form error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// Get consent responses for a store (Admin only)
app.get('/api/stores/:storeId/consent-responses', authenticateToken, (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Check if store exists
    const store = stores.find(s => s.id === storeId);
    if (!store) {
      return res.status(404).json({ message: '한의원을 찾을 수 없습니다.' });
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && store.ownerId !== req.user.userId) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    // Find all responses for this store
    const responses = Array.from(consentResponses.values())
      .filter(response => response.store_id === storeId)
      .map(response => ({
        response_id: response.response_id,
        respondent_name: response.respondent_name,
        respondent_phone: response.respondent_phone,
        respondent_position: response.respondent_position,
        remote_install_date: response.remote_install_date,
        remote_install_time: response.remote_install_time,
        table_count: response.table_count,
        sticker_type: response.sticker_type,
        design_type: response.design_type,
        preferred_color: response.preferred_color,
        terms_agreement: response.terms_agreement,
        note: response.note || '',
        submitted_at: response.submitted_at,
        link_id: response.link_id,
        token: response.token,
        store_id: response.store_id
      }))
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

    // Find link info for this store
    const linkInfo = Array.from(consentLinks.values())
      .find(link => link.store_id === storeId);

    const result = {
      responses: responses,
      total_count: responses.length,
      link_info: linkInfo ? {
        created_at: linkInfo.created_at,
        expires_at: linkInfo.expires_at,
        is_active: linkInfo.is_active && new Date() < new Date(linkInfo.expires_at)
      } : null
    };

    console.log(`📊 동의서 현황 조회: Store ${storeId}, ${responses.length}개 응답`);
    
    res.json({ data: result });

  } catch (error) {
    console.error('Get consent responses error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Sales Log 삭제 (DELETE 메서드 지원)
app.delete('/api/stores/:storeId/sales-logs/:logId', authenticateToken, (req, res) => {
  const { storeId, logId } = req.params;
  
  console.log(`🗑️ Sales Log 삭제 요청: Store ${storeId}, Log ${logId}`);
  
  // 실제 Lambda에서는 DynamoDB에서 삭제하지만, 여기서는 성공 응답만 반환
  res.json({
    success: true,
    message: 'Sales log deleted successfully',
    data: {
      store_id: storeId,
      log_id: logId,
      deleted_at: new Date().toISOString()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/stores`);
  console.log(`   GET  /api/stores/:id`);
  console.log(`   GET  /api/health`);
  console.log(`\n📋 Consent Form endpoints:`);
  console.log(`   POST /api/consent/create-link (Auth required)`);
  console.log(`   GET  /api/consent/form/:token (Public)`);
  console.log(`   POST /api/consent/submit (Public)`);
  console.log(`   GET  /api/stores/:storeId/consent-responses (Auth required)`);
  console.log(`\n👤 Test accounts:`);
  console.log(`   Admin: admin@example.com / password123`);
  console.log(`   User:  user1@example.com / password123`);
});