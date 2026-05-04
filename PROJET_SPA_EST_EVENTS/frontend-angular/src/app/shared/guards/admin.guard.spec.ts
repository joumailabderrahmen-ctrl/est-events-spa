import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', [], { isAdmin: false });
    router      = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
    guard = TestBed.inject(AdminGuard);
  });

  it('retourne false et redirige vers / si l\'utilisateur n\'est pas admin', () => {
    Object.defineProperty(authService, 'isAdmin', { get: () => false });
    const result = guard.canActivate();
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('retourne true si l\'utilisateur est admin', () => {
    Object.defineProperty(authService, 'isAdmin', { get: () => true });
    const result = guard.canActivate();
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
