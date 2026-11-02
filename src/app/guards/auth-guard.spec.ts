// Mit KI erstellt (KI-Log Nr. 26): Nur Admins und Veranstalter kommen in die Verwaltung.
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };

  function runGuard(): boolean {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    ) as boolean;
  }

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
  });

  it('weist nicht angemeldete Besucher ab und leitet zum Login', () => {
    expect(runGuard()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('weist angemeldete Kunden ab', () => {
    TestBed.inject(AuthService).setSession('t', { role: 'customer' });
    expect(runGuard()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it.each(['admin', 'ADMIN', 'organizer'])('lässt die Rolle %s durch', (role) => {
    TestBed.inject(AuthService).setSession('t', { role });
    expect(runGuard()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
