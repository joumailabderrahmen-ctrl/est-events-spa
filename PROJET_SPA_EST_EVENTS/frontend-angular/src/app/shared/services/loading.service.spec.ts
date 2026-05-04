import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoadingService] });
    service = TestBed.inject(LoadingService);
  });

  it('isLoading$ est false au départ', (done) => {
    service.isLoading$.subscribe(v => {
      expect(v).toBeFalse();
      done();
    });
  });

  it('show() passe isLoading$ à true', fakeAsync(() => {
    service.show();
    tick();
    service.isLoading$.subscribe(v => expect(v).toBeTrue());
  }));

  it('hide() après show() repasse isLoading$ à false', fakeAsync(() => {
    service.show();
    tick();
    service.hide();
    tick();
    service.isLoading$.subscribe(v => expect(v).toBeFalse());
  }));

  it('show() deux fois nécessite hide() deux fois pour repasser à false', fakeAsync(() => {
    service.show();
    service.show();
    tick();
    service.hide();
    tick();
    // Encore un appel actif → toujours true
    service.isLoading$.subscribe(v => expect(v).toBeTrue());
    service.hide();
    tick();
    service.isLoading$.subscribe(v => expect(v).toBeFalse());
  }));

  it('hide() sans show() précédent ne produit pas d\'erreur (count min à 0)', fakeAsync(() => {
    expect(() => {
      service.hide();
      tick();
    }).not.toThrow();
  }));
});
