const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'est_events_secret_2025';

exports.signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = await User.findById(payload.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Utilisateur introuvable' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
  next();
};
