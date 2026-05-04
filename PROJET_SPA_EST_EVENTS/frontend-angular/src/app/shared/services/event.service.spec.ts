import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { environment } from '../../../../environments/environment';
import { Event as EstEvent } from '../models/event.model';

describe('EventService', () => {
  let service: EventService;
  let http: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/events`;

  const fakeEvents: EstEvent[] = [
    {
      _id: 'evt1',
      title: 'Hackathon EST 2025',
      description: 'Compétition 24h',
      image: 'event-tech.jpg',
      price: 0,
      date: '2025-11-15T09:00:00.000Z',
      location: 'Salle A',
      category: 'tech',
      capacity: 60,
      isFree: true,
      createdAt: '2025-01-01T00:00:00.000Z'
    },
    {
      _id: 'evt2',
      title: 'Soirée Culturelle',
      description: 'Culture Amazighe',
      image: 'event-culture.jpg',
      price: 30,
      date: '2025-11-22T18:00:00.000Z',
      location: 'Amphithéâtre',
      category: 'culture',
      capacity: 200,
      isFree: false,
      createdAt: '2025-01-01T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventService]
    });
    service = TestBed.inject(EventService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // ── getAll() ────────────────────────────────────────────────────────────────
  it('getAll() envoie GET /api/events', () => {
    service.getAll().subscribe(events => {
      expect(events.length).toBe(2);
      expect(events[0].title).toBe('Hackathon EST 2025');
    });
    const req = http.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(fakeEvents);
  });

  // ── getById() ───────────────────────────────────────────────────────────────
  it('getById() envoie GET /api/events/:id', () => {
    service.getById('evt1').subscribe(event => {
      expect(event._id).toBe('evt1');
      expect(event.title).toBe('Hackathon EST 2025');
    });
    const req = http.expectOne(`${apiUrl}/evt1`);
    expect(req.request.method).toBe('GET');
    req.flush(fakeEvents[0]);
  });

  // ── create() ────────────────────────────────────────────────────────────────
  it('create() envoie POST /api/events', () => {
    const newEvent = { title: 'Nouvel Event', date: '2026-01-01' };
    service.create(newEvent as Partial<EstEvent>).subscribe(event => {
      expect(event._id).toBe('evt3');
    });
    const req = http.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ ...fakeEvents[0], _id: 'evt3', title: 'Nouvel Event' });
  });

  // ── update() ────────────────────────────────────────────────────────────────
  it('update() envoie PUT /api/events/:id', () => {
    const updates = { title: 'Hackathon Modifié' };
    service.update('evt1', updates).subscribe(event => {
      expect(event.title).toBe('Hackathon Modifié');
    });
    const req = http.expectOne(`${apiUrl}/evt1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...fakeEvents[0], title: 'Hackathon Modifié' });
  });

  // ── delete() ────────────────────────────────────────────────────────────────
  it('delete() envoie DELETE /api/events/:id', () => {
    service.delete('evt1').subscribe(res => {
      expect(res).toBeTruthy();
    });
    const req = http.expectOne(`${apiUrl}/evt1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Événement supprimé' });
  });

  // ── getCapacity() ────────────────────────────────────────────────────────────
  it('getCapacity() envoie GET /api/events/:id/capacity', () => {
    service.getCapacity('evt1').subscribe(cap => {
      expect(cap.capacity).toBe(60);
      expect(cap.taken).toBe(10);
      expect(cap.remaining).toBe(50);
    });
    const req = http.expectOne(`${apiUrl}/evt1/capacity`);
    expect(req.request.method).toBe('GET');
    req.flush({ capacity: 60, taken: 10, remaining: 50 });
  });

  // ── getStats() ───────────────────────────────────────────────────────────────
  it('getStats() envoie GET /api/stats', () => {
    service.getStats().subscribe(stats => {
      expect(stats.totalEvents).toBe(8);
    });
    const req = http.expectOne(`${environment.apiUrl}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ totalEvents: 8, freeEvents: 4, paidEvents: 4, totalReservations: 12, totalRevenue: 500 });
  });
});
