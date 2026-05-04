import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [StorageService] });
    service = TestBed.inject(StorageService);
  });

  afterEach(() => localStorage.clear());

  it('set() et get() fonctionnent pour un objet', () => {
    const data = { nom: 'Ahmed', email: 'ahmed@est.ma' };
    service.set('profil', data);
    const result = service.get<typeof data>('profil');
    expect(result).toEqual(data);
  });

  it('get() retourne null si la clé n\'existe pas', () => {
    expect(service.get('inexistant')).toBeNull();
  });

  it('remove() supprime la clé', () => {
    service.set('test', { val: 1 });
    service.remove('test');
    expect(service.get('test')).toBeNull();
  });

  it('clear() vide tout le localStorage', () => {
    service.set('a', 1);
    service.set('b', 2);
    service.clear();
    expect(localStorage.length).toBe(0);
  });

  it('get() retourne null si la valeur JSON est invalide', () => {
    localStorage.setItem('bad', 'not-json{{{');
    expect(service.get('bad')).toBeNull();
  });

  it('set() fonctionne pour les types primitifs (nombre, string)', () => {
    service.set('score', 42);
    expect(service.get<number>('score')).toBe(42);
    service.set('nom', 'EST Dakhla');
    expect(service.get<string>('nom')).toBe('EST Dakhla');
  });
});
