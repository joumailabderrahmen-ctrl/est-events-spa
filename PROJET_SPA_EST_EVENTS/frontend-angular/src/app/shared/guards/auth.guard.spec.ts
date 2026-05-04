import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', [], { isLoggedIn: false });
    router      = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('retourne false et redirige vers /login si non connecté', () => {
    Object.defineProperty(authService, 'isLoggedIn', { get: () => false });
    const result = guard.canActivate();
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('retourne true si l\'utilisateur est connecté', () => {
    Object.defineProperty(authService, 'isLoggedIn', { get: () => true });
    const result = guard.canActivate();
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
