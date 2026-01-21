import jwt from 'jsonwebtoken';
import { clinics, FUNNEL_STAGES } from '../_shared/data.js';

const JWT_SECRET = process.env.JWT_SECRET || 'leandiet-jwt-secret-key-2024';

function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

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

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ message: 'Access token required' });
  }

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

  clinics.forEach(c => {
    if (c.assignee) {
      stats.byAssignee[c.assignee] = (stats.byAssignee[c.assignee] || 0) + 1;
    }
  });

  clinics.forEach(c => {
    if (c.region) {
      stats.byRegion[c.region] = (stats.byRegion[c.region] || 0) + 1;
    }
  });

  return res.json({ data: stats });
}
