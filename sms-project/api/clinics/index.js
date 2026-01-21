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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ message: 'Access token required' });
  }

  if (req.method === 'GET') {
    let filteredClinics = [...clinics];
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

    return res.json({ data: filteredClinics });
  }

  if (req.method === 'POST') {
    const newClinic = {
      cid: `clinic${Date.now()}`,
      ...req.body,
      history: req.body.history || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    clinics.push(newClinic);
    return res.status(201).json({ data: newClinic });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
