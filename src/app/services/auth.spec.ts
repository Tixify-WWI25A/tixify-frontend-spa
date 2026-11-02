// Mit KI erstellt (KI-Log Nr. 26): Sitzung speichern, Rollen erkennen, Abmelden.
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth';

function fakeJwt(payload: object): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

describe('AuthService', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };

  function create(): AuthService {
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: vi.fn() };
  });

  it('ist ohne gespeicherte Sitzung abgemeldet', () => {
    const auth = create();
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.currentUser()).toBeNull();
    expect(auth.isAdmin()).toBe(false);
  });

  it('speichert Token und Benutzer bei setSession', () => {
    const auth = create();
    auth.setSession('abc.def.ghi', { email: 'admin@tixify.de', role: 'ADMIN' });

    expect(localStorage.getItem('token')).toBe('abc.def.ghi');
    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.getRole()).toBe('admin');
    expect(auth.isAdmin()).toBe(true);
  });

  it('erkennt Kunden nicht als Admin oder Veranstalter', () => {
    const auth = create();
    auth.setSession('t', { role: 'customer' });
    expect(auth.isAdminOrOrganizer()).toBe(false);
  });

  it('erkennt Veranstalter als berechtigt, aber nicht als Admin', () => {
    const auth = create();
    auth.setSession('t', { role: 'organizer' });
    expect(auth.isAdminOrOrganizer()).toBe(true);
    expect(auth.isAdmin()).toBe(false);
  });

  it('liest den Benutzer aus dem Token, wenn kein Benutzer gespeichert ist', () => {
    localStorage.setItem('token', fakeJwt({ user_id: 7, email: 'eva@tixify.de', role: 'customer' }));
    const auth = create();
    expect(auth.currentUser()).toEqual({ id: 7, name: 'Admin', email: 'eva@tixify.de', role: 'customer' });
    expect(auth.isAdminOrOrganizer()).toBe(false);
  });

  it('ignoriert einen beschädigten gespeicherten Benutzer', () => {
    localStorage.setItem('user', '{kein json');
    const auth = create();
    expect(auth.currentUser()).toBeNull();
  });

  it('löscht beim Abmelden die Sitzung und leitet zum Login', () => {
    const auth = create();
    auth.setSession('t', { role: 'admin' });
    auth.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(auth.currentUser()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
