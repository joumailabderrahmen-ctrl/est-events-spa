import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const mockResponse = {
    token: 'fake.jwt.token',
    user: { _id: 'u1', name: 'Ahmed Test', email: 'ahmed@est.ma', role: 'student' as const }
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  // ── isLoggedIn ──────────────────────────────────────────────────────────────
  it('isLoggedIn retourne false si aucun token en localStorage', () => {
    expect(service.isLoggedIn).toBeFalse();
  });

  it('isLoggedIn retourne true si un token est présent', () => {
    localStorage.setItem('est_jwt', 'some.token');
    expect(service.isLoggedIn).toBeTrue();
  });

  // ── isAdmin ─────────────────────────────────────────────────────────────────
  it('isAdmin retourne false si l\'utilisateur est student', () => {
    localStorage.setItem('est_user', JSON.stringify({ role: 'student' }));
    // Recréer le service pour lire localStorage
    service = new AuthService(TestBed.inject(require('@angular/common/http').HttpClient));
    expect(service.isAdmin).toBeFalse();
  });

  // ── currentUser ─────────────────────────────────────────────────────────────
  it('currentUser retourne null si non connecté', () => {
    expect(service.currentUser).toBeNull();
  });

  // ── login() ─────────────────────────────────────────────────────────────────
  it('login() envoie POST /api/auth/login avec les bonnes données', () => {
    service.login('ahmed@est.ma', 'pass123').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'ahmed@est.ma', password: 'pass123' });
    req.flush(mockResponse);
  });

  it('login() stocke le token et l\'utilisateur dans localStorage', () => {
    service.login('ahmed@est.ma', 'pass123').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockResponse);

    expect(localStorage.getItem('est_jwt')).toBe('fake.jwt.token');
    const storedUser = JSON.parse(localStorage.getItem('est_user')!);
    expect(storedUser.email).toBe('ahmed@est.ma');
  });

  it('login() met à jour currentUser$', (done) => {
    service.login('ahmed@est.ma', 'pass123').subscribe(() => {
      service.user$.subscribe(user => {
        expect(user?.email).toBe('ahmed@est.ma');
        done();
      });
    });
    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockResponse);
  });

  // ── register() ──────────────────────────────────────────────────────────────
  it('register() envoie POST /api/auth/register avec les bonnes données', () => {
    service.register('Ahmed', 'ahmed@est.ma', 'pass123').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Ahmed', email: 'ahmed@est.ma', password: 'pass123' });
    req.flush({ ...mockResponse, status: 201 });
  });

  // ── logout() ────────────────────────────────────────────────────────────────
  it('logout() supprime le token et l\'utilisateur de localStorage', () => {
    localStorage.setItem('est_jwt', 'token');
    localStorage.setItem('est_user', JSON.stringify(mockResponse.user));
    service.logout();
    expect(localStorage.getItem('est_jwt')).toBeNull();
    expect(localStorage.getItem('est_user')).toBeNull();
  });

  it('logout() met currentUser$ à null', (done) => {
    // Simuler connexion
    service.login('ahmed@est.ma', 'pass123').subscribe(() => {
      service.logout();
      service.user$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });
    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockResponse);
  });

  // ── getToken() ──────────────────────────────────────────────────────────────
  it('getToken() retourne null si aucun token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken() retourne le token stocké', () => {
    localStorage.setItem('est_jwt', 'my.token.here');
    expect(service.getToken()).toBe('my.token.here');
  });
});
