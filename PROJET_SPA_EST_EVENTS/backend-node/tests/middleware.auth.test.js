/**
 * Tests unitaires — middleware/auth.js
 * Couvre : signToken, authenticate, requireAdmin
 */
const jwt = require('jsonwebtoken');

// Mock Mongoose User.findById
jest.mock('../models/User', () => ({
  findById: jest.fn()
}));
const User = require('../models/User');
const { signToken, authenticate, requireAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'est_events_secret_2025';

const mockUser = { _id: 'abc123', name: 'Test', email: 'test@est.ma', role: 'student', select: jest.fn() };

// ── signToken ─────────────────────────────────────────────────────────────────
describe('signToken()', () => {
  it('retourne un token JWT valide', () => {
    const token = signToken({ _id: 'abc123', role: 'student' });
    expect(typeof token).toBe('string');
    const payload = jwt.verify(token, JWT_SECRET);
    expect(payload.id).toBe('abc123');
    expect(payload.role).toBe('student');
  });

  it('le token expire dans 7 jours', () => {
    const token = signToken({ _id: 'xyz', role: 'admin' });
    const payload = jwt.decode(token);
    const diffDays = (payload.exp - payload.iat) / 86400;
    expect(diffDays).toBe(7);
  });
});

// ── authenticate ──────────────────────────────────────────────────────────────
describe('authenticate()', () => {
  const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes.status.mockReturnThis();
  });

  it('retourne 401 si pas de header Authorization', async () => {
    const mockReq = { headers: {} };
    await authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Non authentifié' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retourne 401 si le header ne commence pas par Bearer', async () => {
    const mockReq = { headers: { authorization: 'Basic abc123' } };
    await authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('retourne 401 si token invalide / expiré', async () => {
    const mockReq = { headers: { authorization: 'Bearer token_invalide' } };
    await authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token invalide' });
  });

  it('retourne 401 si utilisateur introuvable en BDD', async () => {
    const token = signToken({ _id: 'notexist', role: 'student' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const mockReq = { headers: { authorization: `Bearer ${token}` } };
    await authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Utilisateur introuvable' });
  });

  it('appelle next() et attache req.user si token valide', async () => {
    const token = signToken({ _id: 'abc123', role: 'student' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const mockReq = { headers: { authorization: `Bearer ${token}` } };
    await authenticate(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual(mockUser);
  });
});

// ── requireAdmin ──────────────────────────────────────────────────────────────
describe('requireAdmin()', () => {
  const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const mockNext = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('retourne 403 si l\'utilisateur n\'est pas admin', () => {
    const req = { user: { role: 'student' } };
    requireAdmin(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Accès refusé' });
  });

  it('retourne 403 si req.user est null', () => {
    const req = { user: null };
    requireAdmin(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });

  it('appelle next() si l\'utilisateur est admin', () => {
    const req = { user: { role: 'admin' } };
    requireAdmin(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});
