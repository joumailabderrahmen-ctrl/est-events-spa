/**
 * Tests unitaires — controllers/reservationController.js
 * Couvre : createReservation (avec vérification capacité), getAllReservations,
 *          cancelReservation, confirmReservation
 */

jest.mock('../models/Reservation');
jest.mock('../models/Event');

const Reservation = require('../models/Reservation');
const Event       = require('../models/Event');
const ctrl        = require('../controllers/reservationController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

const fakeEvent = { _id: 'evt1', title: 'Hackathon', capacity: 60 };
const fakeReservation = {
  _id: 'res1',
  studentName: 'Ahmed',
  studentEmail: 'ahmed@est.ma',
  events: [{ eventId: 'evt1', title: 'Hackathon', price: 0 }],
  total: 0,
  status: 'pending'
};

// ── createReservation ──────────────────────────────────────────────────────────
describe('createReservation()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('crée une réservation si des places sont disponibles (201)', async () => {
    Event.findById.mockResolvedValue(fakeEvent);
    Reservation.countDocuments.mockResolvedValue(10); // 10 prises sur 60
    const mockSave = jest.fn().mockResolvedValue(fakeReservation);
    Reservation.mockImplementation(() => ({ save: mockSave }));

    const req = {
      body: {
        studentName: 'Ahmed',
        studentEmail: 'ahmed@est.ma',
        events: [{ eventId: 'evt1', title: 'Hackathon', price: 0 }],
        total: 0
      }
    };
    const res = mockRes();
    await ctrl.createReservation(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('retourne 400 si l\'événement est complet', async () => {
    Event.findById.mockResolvedValue({ ...fakeEvent, capacity: 10 });
    Reservation.countDocuments.mockResolvedValue(10); // complet

    const req = {
      body: {
        studentName: 'Fatima',
        studentEmail: 'fatima@est.ma',
        events: [{ eventId: 'evt1', title: 'Hackathon', price: 0 }],
        total: 0
      }
    };
    const res = mockRes();
    await ctrl.createReservation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Plus de places') })
    );
  });

  it('retourne 404 si l\'événement n\'existe pas', async () => {
    Event.findById.mockResolvedValue(null);
    const req = {
      body: { events: [{ eventId: 'ghost' }] }
    };
    const res = mockRes();
    await ctrl.createReservation(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ── getAllReservations ─────────────────────────────────────────────────────────
describe('getAllReservations()', () => {
  it('retourne toutes les réservations', async () => {
    Reservation.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([fakeReservation]) })
    });
    const req = { query: {} };
    const res = mockRes();
    await ctrl.getAllReservations(req, res);
    expect(res.json).toHaveBeenCalledWith([fakeReservation]);
  });

  it('filtre par email si fourni en query', async () => {
    const mockLimit = jest.fn().mockResolvedValue([fakeReservation]);
    const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
    Reservation.find.mockReturnValue({ sort: mockSort });

    const req = { query: { email: 'Ahmed@EST.ma' } };
    const res = mockRes();
    await ctrl.getAllReservations(req, res);
    expect(Reservation.find).toHaveBeenCalledWith({ studentEmail: 'ahmed@est.ma' });
  });

  it('retourne 500 en cas d\'erreur BDD', async () => {
    Reservation.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ limit: jest.fn().mockRejectedValue(new Error('BDD')) })
    });
    const res = mockRes();
    await ctrl.getAllReservations({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── cancelReservation ─────────────────────────────────────────────────────────
describe('cancelReservation()', () => {
  it('annule une réservation en attente', async () => {
    const mockSave = jest.fn().mockResolvedValue({ ...fakeReservation, status: 'cancelled' });
    Reservation.findById.mockResolvedValue({ ...fakeReservation, save: mockSave });

    const req = { params: { id: 'res1' } };
    const res = mockRes();
    await ctrl.cancelReservation(req, res);
    expect(mockSave).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('retourne 400 si déjà annulée', async () => {
    Reservation.findById.mockResolvedValue({
      ...fakeReservation,
      status: 'cancelled',
      save: jest.fn()
    });
    const req = { params: { id: 'res1' } };
    const res = mockRes();
    await ctrl.cancelReservation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Déjà annulée' });
  });

  it('retourne 404 si réservation introuvable', async () => {
    Reservation.findById.mockResolvedValue(null);
    const req = { params: { id: 'ghost' } };
    const res = mockRes();
    await ctrl.cancelReservation(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ── confirmReservation ────────────────────────────────────────────────────────
describe('confirmReservation()', () => {
  it('confirme une réservation (admin)', async () => {
    const confirmed = { ...fakeReservation, status: 'confirmed' };
    Reservation.findByIdAndUpdate.mockResolvedValue(confirmed);
    const req = { params: { id: 'res1' } };
    const res = mockRes();
    await ctrl.confirmReservation(req, res);
    expect(res.json).toHaveBeenCalledWith(confirmed);
  });

  it('retourne 404 si réservation introuvable', async () => {
    Reservation.findByIdAndUpdate.mockResolvedValue(null);
    const req = { params: { id: 'ghost' } };
    const res = mockRes();
    await ctrl.confirmReservation(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
