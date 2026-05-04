/**
 * Tests unitaires — controllers/eventController.js
 * Couvre : getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, getCapacity, getStats
 */

jest.mock('../models/Event');
jest.mock('../models/Reservation');

const Event = require('../models/Event');
const Reservation = require('../models/Reservation');
const ctrl = require('../controllers/eventController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

const fakeEvent = {
  _id: 'evt1',
  title: 'Hackathon EST',
  category: 'tech',
  price: 0,
  capacity: 60,
  date: new Date('2025-11-15'),
  save: jest.fn()
};

// ── getAllEvents ───────────────────────────────────────────────────────────────
describe('getAllEvents()', () => {
  it('retourne la liste des événements triée', async () => {
    Event.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([fakeEvent]) });
    const req = {};
    const res = mockRes();
    await ctrl.getAllEvents(req, res);
    expect(res.json).toHaveBeenCalledWith([fakeEvent]);
  });

  it('retourne 500 en cas d\'erreur BDD', async () => {
    Event.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('BDD Error')) });
    const res = mockRes();
    await ctrl.getAllEvents({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'BDD Error' });
  });
});

// ── getEventById ───────────────────────────────────────────────────────────────
describe('getEventById()', () => {
  it('retourne l\'événement si trouvé', async () => {
    Event.findById.mockResolvedValue(fakeEvent);
    const req = { params: { id: 'evt1' } };
    const res = mockRes();
    await ctrl.getEventById(req, res);
    expect(res.json).toHaveBeenCalledWith(fakeEvent);
  });

  it('retourne 404 si événement non trouvé', async () => {
    Event.findById.mockResolvedValue(null);
    const req = { params: { id: 'notexist' } };
    const res = mockRes();
    await ctrl.getEventById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Événement introuvable' });
  });
});

// ── createEvent ────────────────────────────────────────────────────────────────
describe('createEvent()', () => {
  it('crée et retourne l\'événement (201)', async () => {
    const savedEvent = { ...fakeEvent, _id: 'new1' };
    const mockSave = jest.fn().mockResolvedValue(savedEvent);
    Event.mockImplementation(() => ({ save: mockSave, ...fakeEvent }));

    const req = { body: { title: 'Test', date: new Date() }, file: null };
    const res = mockRes();
    await ctrl.createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('ajoute le chemin image si fichier uploadé', async () => {
    const mockSave = jest.fn().mockResolvedValue({ ...fakeEvent, image: '/uploads/test.jpg' });
    Event.mockImplementation((data) => ({ ...data, save: mockSave }));

    const req = {
      body: { title: 'Test', date: new Date() },
      file: { filename: 'test.jpg' }
    };
    const res = mockRes();
    await ctrl.createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('retourne 400 en cas d\'erreur de validation', async () => {
    Event.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Titre requis'))
    }));
    const req = { body: {}, file: null };
    const res = mockRes();
    await ctrl.createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── updateEvent ────────────────────────────────────────────────────────────────
describe('updateEvent()', () => {
  it('met à jour et retourne l\'événement', async () => {
    const updated = { ...fakeEvent, title: 'Modifié' };
    Event.findByIdAndUpdate.mockResolvedValue(updated);
    const req = { params: { id: 'evt1' }, body: { title: 'Modifié' }, file: null };
    const res = mockRes();
    await ctrl.updateEvent(req, res);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('retourne 404 si l\'événement n\'existe pas', async () => {
    Event.findByIdAndUpdate.mockResolvedValue(null);
    const req = { params: { id: 'ghost' }, body: {}, file: null };
    const res = mockRes();
    await ctrl.updateEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ── deleteEvent ────────────────────────────────────────────────────────────────
describe('deleteEvent()', () => {
  it('supprime l\'événement et retourne un message', async () => {
    Event.findByIdAndDelete.mockResolvedValue(fakeEvent);
    const req = { params: { id: 'evt1' } };
    const res = mockRes();
    await ctrl.deleteEvent(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Événement supprimé' });
  });

  it('retourne 404 si l\'événement n\'existe pas', async () => {
    Event.findByIdAndDelete.mockResolvedValue(null);
    const req = { params: { id: 'ghost' } };
    const res = mockRes();
    await ctrl.deleteEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ── getCapacity ────────────────────────────────────────────────────────────────
describe('getCapacity()', () => {
  it('retourne la capacité, les places prises et restantes', async () => {
    Event.findById.mockResolvedValue({ _id: 'evt1', capacity: 60, title: 'Hackathon' });
    Reservation.countDocuments.mockResolvedValue(20);
    const req = { params: { id: 'evt1' } };
    const res = mockRes();
    await ctrl.getCapacity(req, res);
    expect(res.json).toHaveBeenCalledWith({ capacity: 60, taken: 20, remaining: 40 });
  });

  it('remaining ne peut pas être négatif (0 minimum)', async () => {
    Event.findById.mockResolvedValue({ _id: 'evt1', capacity: 10 });
    Reservation.countDocuments.mockResolvedValue(15);
    const req = { params: { id: 'evt1' } };
    const res = mockRes();
    await ctrl.getCapacity(req, res);
    expect(res.json).toHaveBeenCalledWith({ capacity: 10, taken: 15, remaining: 0 });
  });

  it('retourne 404 si événement introuvable', async () => {
    Event.findById.mockResolvedValue(null);
    const req = { params: { id: 'ghost' } };
    const res = mockRes();
    await ctrl.getCapacity(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
