import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReservationService } from './reservation.service';
import { environment } from '../../../../environments/environment';
import { CartItem } from '../models/reservation.model';

describe('ReservationService', () => {
  let service: ReservationService;
  let http: HttpTestingController;

  const fakeCartItem: CartItem = {
    eventId: 'evt1',
    title: 'Hackathon EST 2025',
    price: 0,
    image: 'event-tech.jpg',
    category: 'tech'
  };

  const fakeCartItemPaid: CartItem = {
    eventId: 'evt2',
    title: 'Soirée Culturelle',
    price: 30,
    image: 'event-culture.jpg',
    category: 'culture'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReservationService]
    });
    service = TestBed.inject(ReservationService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  // ── Panier (Cart) ────────────────────────────────────────────────────────────
  it('le panier est vide au départ', (done) => {
    service.getCart().subscribe(cart => {
      expect(cart.length).toBe(0);
      done();
    });
  });

  it('addToCart() ajoute un élément au panier', (done) => {
    service.addToCart(fakeCartItem);
    service.getCart().subscribe(cart => {
      expect(cart.length).toBe(1);
      expect(cart[0].title).toBe('Hackathon EST 2025');
      done();
    });
  });

  it('addToCart() n\'ajoute pas un doublon', (done) => {
    service.addToCart(fakeCartItem);
    service.addToCart(fakeCartItem); // doublon
    service.getCart().subscribe(cart => {
      expect(cart.length).toBe(1);
      done();
    });
  });

  it('removeFromCart() supprime un élément du panier', (done) => {
    service.addToCart(fakeCartItem);
    service.addToCart(fakeCartItemPaid);
    service.removeFromCart('evt1');
    service.getCart().subscribe(cart => {
      expect(cart.length).toBe(1);
      expect(cart[0].eventId).toBe('evt2');
      done();
    });
  });

  it('clearCart() vide le panier', (done) => {
    service.addToCart(fakeCartItem);
    service.addToCart(fakeCartItemPaid);
    service.clearCart();
    service.getCart().subscribe(cart => {
      expect(cart.length).toBe(0);
      done();
    });
  });

  it('getCartSnapshot() retourne l\'état actuel du panier', () => {
    service.addToCart(fakeCartItem);
    const snapshot = service.getCartSnapshot();
    expect(snapshot.length).toBe(1);
    expect(snapshot[0].eventId).toBe('evt1');
  });

  it('le panier persiste dans localStorage', () => {
    service.addToCart(fakeCartItem);
    const stored = JSON.parse(localStorage.getItem('est_cart') || '[]');
    expect(stored.length).toBe(1);
  });

  it('calcule correctement le total du panier', (done) => {
    service.addToCart(fakeCartItem);      // 0 MAD
    service.addToCart(fakeCartItemPaid);  // 30 MAD
    service.getCart().subscribe(cart => {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      expect(total).toBe(30);
      done();
    });
  });

  // ── API calls ────────────────────────────────────────────────────────────────
  it('createReservation() envoie POST /api/reservations', () => {
    const payload = {
      studentName: 'Ahmed',
      studentEmail: 'ahmed@est.ma',
      events: [{ eventId: 'evt1', title: 'Hackathon', price: 0 }],
      total: 0,
      status: 'pending' as const,
      _id: 'res1'
    };
    service.createReservation(payload).subscribe(res => {
      expect(res._id).toBe('res1');
    });
    const req = http.expectOne(`${environment.apiUrl}/reservations`);
    expect(req.request.method).toBe('POST');
    req.flush(payload);
  });

  it('getAll() envoie GET /api/reservations?email=...', () => {
    service.getAll('ahmed@est.ma').subscribe(res => {
      expect(Array.isArray(res)).toBeTrue();
    });
    const req = http.expectOne(`${environment.apiUrl}/reservations?email=ahmed@est.ma`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
