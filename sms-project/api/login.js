const users = [
  { id: 'admin1', email: 'admin@leandiet.co.kr', password: 'leandiet1!', name: 'Admin', role: 'ADMIN' },
  { id: 'medistream1', email: 'taegyu.lee@medistream.co.kr', password: 'asdf12345!', name: 'Lee Taegyu', role: 'ADMIN' },
  { id: 'medistream2', email: 'ilnyeong.cho@medistream.co.kr', password: 'asdf12345!', name: 'Cho Ilnyeong', role: 'ADMIN' },
  { id: 'medistream3', email: 'jongeon.na@medistream.co.kr', password: 'asdf12345!', name: 'Na Jongeon', role: 'ADMIN' }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = users.find(u => u.email === email);
  if (!user || password !== user.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');

  return res.status(200).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
}
