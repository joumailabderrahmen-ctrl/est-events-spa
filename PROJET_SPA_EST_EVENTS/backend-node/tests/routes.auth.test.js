/**
 * Tests d'intégration — routes/auth.js (via Supertest)
 * Couvre : POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
 *
 * Utilise une base MongoDB en mémoire pour isolation totale.
 */

const request  = require('supertest');
const mongoose = require('mongoose');
const express  = require('express');

// App légère pour les tests (sans WebSocket/MongoDB réel)
const app = express();
app.use(express.json());

// Mock mongoose connect
jest.mock('../config/db', () => jest.fn());

// Utiliser les vrais modèles avec mongoose.connect mocked
const authRouter = require('../routes/auth');
app.use('/api/auth', authRouter);

// Mock User model complet
jest.mock('../models/User', () => {
  const mockUser = {
    _id: 'user123',
    name: 'Ahmed Test',
    email: 'ahmed@est.ma',
    role: 'student',
    createdAt: new Date(),
    comparePassword: jest.fn(),
    toJSON: jest.fn().mockReturnValue({
      _id: 'user123',
      name: 'Ahmed Test',
      email: 'ahmed@est.ma',
      role: 'student'
    })
  };

  const MockUser = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'user123',
    role: 'student',
    save: jest.fn().mockResolvedValue(mockUser),
    comparePassword: jest.fn(),
    toJSON: jest.fn().mockReturnValue({
      _id: 'user123',
      name: data.name,
      email: data.email,
      role: 'student'
    })
  }));

  MockUser.findOne = jest.fn();
  MockUser.create  = jest.fn().mockResolvedValue(mockUser);
  MockUser.findById = jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue(mockUser)
  });

  return MockUser;
});

const User = require('../models/User');

// ── POST /api/auth/register ────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 422 si le nom est manquant', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@est.ma', password: 'pass123' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('retourne 422 si l\'email est invalide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ahmed', email: 'pas-un-email', password: 'pass123' });
    expect(res.status).toBe(422);
  });

  it('retourne 422 si le mot de passe est trop court (< 6)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ahmed', email: 'a@est.ma', password: '123' });
    expect(res.status).toBe(422);
  });

  it('retourne 409 si l\'email est déjà utilisé', async () => {
    User.findOne.mockResolvedValue({ email: 'ahmed@est.ma' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ahmed', email: 'ahmed@est.ma', password: 'pass123' });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email déjà utilisé');
  });

  it('retourne 201 avec token + user pour données valides', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ahmed', email: 'nouveau@est.ma', password: 'pass123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });
});

// ── POST /api/auth/login ───────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 422 si l\'email est manquant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'pass123' });
    expect(res.status).toBe(422);
  });

  it('retourne 422 si le mot de passe est manquant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@est.ma' });
    expect(res.status).toBe(422);
  });

  it('retourne 401 si l\'utilisateur n\'existe pas', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@est.ma', password: 'pass123' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Identifiants incorrects');
  });

  it('retourne 401 si le mot de passe est incorrect', async () => {
    const fakeUser = {
      email: 'ahmed@est.ma',
      comparePassword: jest.fn().mockResolvedValue(false)
    };
    User.findOne.mockResolvedValue(fakeUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ahmed@est.ma', password: 'mauvais' });
    expect(res.status).toBe(401);
  });

  it('retourne 200 avec token + user pour identifiants valides', async () => {
    const fakeUser = {
      _id: 'u1',
      name: 'Ahmed',
      email: 'ahmed@est.ma',
      role: 'student',
      comparePassword: jest.fn().mockResolvedValue(true),
      toJSON: jest.fn().mockReturnValue({ _id: 'u1', name: 'Ahmed', email: 'ahmed@est.ma', role: 'student' })
    };
    User.findOne.mockResolvedValue(fakeUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ahmed@est.ma', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('retourne 401 avec un token invalide', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token_invalide');
    expect(res.status).toBe(401);
  });
});
