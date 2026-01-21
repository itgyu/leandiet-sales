import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'leandiet-jwt-secret-key-2024';

const users = [
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

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse body if it's a string
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { email, password } = body || {};

    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    }

    const user = users.find(u => u.email === email);
    if (!user || password !== user.password) {
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
      { expiresIn: '24h' }
    );

    return res.status(200).json({
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
    return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
}
