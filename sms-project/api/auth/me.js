import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'leandiet-jwt-secret-key-2024';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      res.json({
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role
      });
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}
