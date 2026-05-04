/**
 * Tests unitaires — Models Mongoose
 * Couvre : Event, Reservation, User (validation + virtuals + méthodes)
 */

const mongoose = require('mongoose');

// ── EVENT MODEL ────────────────────────────────────────────────────────────────
describe('Event Model', () => {
  const Event = require('../models/Event');

  it('a les champs requis : title et date', () => {
    const paths = Event.schema.paths;
    expect(paths.title.isRequired).toBe(true);
    expect(paths.date.isRequired).toBe(true);
  });

  it('le virtuel isFree retourne true si price === 0', () => {
    const event = new Event({ title: 'Test', date: new Date(), price: 0 });
    expect(event.isFree).toBe(true);
  });

  it('le virtuel isFree retourne false si price > 0', () => {
    const event = new Event({ title: 'Test', date: new Date(), price: 50 });
    expect(event.isFree).toBe(false);
  });

  it('la catégorie par défaut est "autre"', () => {
    const event = new Event({ title: 'Test', date: new Date() });
    expect(event.category).toBe('autre');
  });

  it('rejette une catégorie invalide', () => {
    const event = new Event({ title: 'Test', date: new Date(), category: 'invalid' });
    const err = event.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.category).toBeDefined();
  });

  it('accepte les catégories valides', () => {
    const categories = ['tech', 'culture', 'sport', 'science', 'music', 'autre'];
    categories.forEach(cat => {
      const event = new Event({ title: 'Test', date: new Date(), category: cat });
      const err = event.validateSync();
      expect(err?.errors?.category).toBeUndefined();
    });
  });

  it('la capacité par défaut est 100', () => {
    const event = new Event({ title: 'Test', date: new Date() });
    expect(event.capacity).toBe(100);
  });

  it('le prix ne peut pas être négatif', () => {
    const event = new Event({ title: 'Test', date: new Date(), price: -10 });
    const err = event.validateSync();
    expect(err?.errors?.price).toBeDefined();
  });

  it('le titre est trimé (espaces supprimés)', () => {
    const event = new Event({ title: '  Hackathon  ', date: new Date() });
    expect(event.title).toBe('Hackathon');
  });
});

// ── RESERVATION MODEL ──────────────────────────────────────────────────────────
describe('Reservation Model', () => {
  const Reservation = require('../models/Reservation');

  it('a les champs requis : studentName et studentEmail', () => {
    const paths = Reservation.schema.paths;
    expect(paths.studentName.isRequired).toBe(true);
    expect(paths.studentEmail.isRequired).toBe(true);
  });

  it('le statut par défaut est "pending"', () => {
    const res = new Reservation({
      studentName: 'Ahmed',
      studentEmail: 'ahmed@est.ma'
    });
    expect(res.status).toBe('pending');
  });

  it('accepte les statuts : pending, confirmed, cancelled', () => {
    ['pending', 'confirmed', 'cancelled'].forEach(status => {
      const res = new Reservation({
        studentName: 'Test',
        studentEmail: 'test@est.ma',
        status
      });
      const err = res.validateSync();
      expect(err?.errors?.status).toBeUndefined();
    });
  });

  it('rejette un statut invalide', () => {
    const res = new Reservation({
      studentName: 'Test',
      studentEmail: 'test@est.ma',
      status: 'invalid'
    });
    const err = res.validateSync();
    expect(err?.errors?.status).toBeDefined();
  });

  it('l\'email est converti en minuscules', () => {
    const res = new Reservation({
      studentName: 'Fatima',
      studentEmail: 'FATIMA@EST.MA'
    });
    expect(res.studentEmail).toBe('fatima@est.ma');
  });

  it('le total par défaut est 0', () => {
    const res = new Reservation({ studentName: 'Ahmed', studentEmail: 'a@est.ma' });
    expect(res.total).toBe(0);
  });
});

// ── USER MODEL ─────────────────────────────────────────────────────────────────
describe('User Model', () => {
  const User = require('../models/User');

  it('a les champs requis : name, email, password', () => {
    const paths = User.schema.paths;
    expect(paths.name.isRequired).toBe(true);
    expect(paths.email.isRequired).toBe(true);
    expect(paths.password.isRequired).toBe(true);
  });

  it('le rôle par défaut est "student"', () => {
    const user = new User({ name: 'Ahmed', email: 'a@est.ma', password: 'pass123' });
    expect(user.role).toBe('student');
  });

  it('accepte les rôles : student et admin', () => {
    ['student', 'admin'].forEach(role => {
      const user = new User({ name: 'Test', email: 'test@est.ma', password: 'pass123', role });
      const err = user.validateSync();
      expect(err?.errors?.role).toBeUndefined();
    });
  });

  it('rejette un rôle invalide', () => {
    const user = new User({ name: 'Test', email: 'test@est.ma', password: 'pass123', role: 'superadmin' });
    const err = user.validateSync();
    expect(err?.errors?.role).toBeDefined();
  });

  it('l\'email est converti en minuscules', () => {
    const user = new User({ name: 'Ahmed', email: 'AHMED@EST.MA', password: 'pass123' });
    expect(user.email).toBe('ahmed@est.ma');
  });

  it('comparePassword() est une méthode définie', () => {
    const user = new User({ name: 'Test', email: 'test@est.ma', password: 'pass123' });
    expect(typeof user.comparePassword).toBe('function');
  });

  it('le mot de passe est exclu du toJSON', () => {
    const user = new User({ name: 'Test', email: 'test@est.ma', password: 'pass123' });
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
  });
});
