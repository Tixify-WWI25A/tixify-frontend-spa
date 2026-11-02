// Mit KI erstellt (KI-Log Nr. 26): Benutzerverwaltung (Suche, Rollen, Löschen).
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Users } from './users';
import { ApiService, UserItem } from '../../services/api';

const USERS: UserItem[] = [
  { id: 1, name: 'Eva', email: 'eva@tixify.de', role: 'admin' },
  { id: 2, name: 'Max', email: 'max@example.com', role: 'customer' }
];

describe('Users', () => {
  let api: Record<string, ReturnType<typeof vi.fn>>;

  async function create(): Promise<Users> {
    TestBed.configureTestingModule({ imports: [Users], providers: [{ provide: ApiService, useValue: api }] });
    const fixture = TestBed.createComponent(Users);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    api = {
      getUsers: vi.fn(() => of(USERS.map(u => ({ ...u })))),
      updateUserRole: vi.fn(() => of({})),
      deleteUser: vi.fn(() => of({}))
    };
  });

  it('lädt die Benutzer und sucht in Name, E-Mail und Rolle', async () => {
    const c = await create();
    expect(c.users().length).toBe(2);
    c.searchQuery.set('CUSTOMER');
    expect(c.filteredUsers().map(u => u.id)).toEqual([2]);
    c.searchQuery.set('tixify.de');
    expect(c.filteredUsers().map(u => u.id)).toEqual([1]);
  });

  it('zeigt die Fehlermeldung des Servers, wenn Laden nicht erlaubt ist', async () => {
    api['getUsers'].mockReturnValue(throwError(() => ({ error: { error: 'Keine Berechtigung' } })));
    const c = await create();
    expect(c.isLoading()).toBe(false);
    expect(c.statusMessage()).toBe('Fehler beim Laden: Keine Berechtigung');
  });

  it('übernimmt eine geänderte Rolle erst nach Bestätigung durch den Server', async () => {
    const c = await create();
    const max = c.users()[1];
    c.onRoleChange(max, 'organizer');
    expect(api['updateUserRole']).toHaveBeenCalledWith(2, 'organizer');
    expect(max.role).toBe('organizer');
  });

  it('lässt die Rolle unverändert, wenn der Server ablehnt', async () => {
    api['updateUserRole'].mockReturnValue(throwError(() => ({ error: { error: 'Verboten' } })));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const c = await create();
    const max = c.users()[1];
    c.onRoleChange(max, 'admin');
    expect(max.role).toBe('customer');
    expect(alertSpy).toHaveBeenCalledWith('Fehler beim Ändern der Rolle: Verboten');
    alertSpy.mockRestore();
  });

  it('löscht nur nach Bestätigung und entfernt den Benutzer aus der Liste', async () => {
    const c = await create();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    c.deleteUser(c.users()[1]);
    expect(api['deleteUser']).not.toHaveBeenCalled();
    c.deleteUser(c.users()[1]);
    expect(api['deleteUser']).toHaveBeenCalledWith(2);
    expect(c.users().map(u => u.id)).toEqual([1]);
    confirmSpy.mockRestore();
  });
});
