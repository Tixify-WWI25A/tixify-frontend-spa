// Mit KI erstellt (KI-Log Nr. 26): Pfade, Methoden und Token der API-Aufrufe.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api';
import { AuthService } from './auth';

const BASE = 'https://tixify-c7a903638236.herokuapp.com';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    TestBed.inject(AuthService).setSession('test-token', { role: 'admin' });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lädt Events öffentlich ohne Token', () => {
    api.getEvents().subscribe();
    const req = http.expectOne(`${BASE}/api/events`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('schickt beim Anlegen eines Events das Token mit', () => {
    api.createEvent({ title: 'Test' }).subscribe();
    const req = http.expectOne(`${BASE}/api/events`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(req.request.body).toEqual({ title: 'Test' });
    req.flush({});
  });

  it('ändert Events per PATCH und löscht per DELETE, jeweils mit Token', () => {
    api.updateEvent(3, { price: 10 }).subscribe();
    api.deleteEvent(4).subscribe();
    const patch = http.expectOne(`${BASE}/api/events/3`);
    const del = http.expectOne(`${BASE}/api/events/4`);
    expect(patch.request.method).toBe('PATCH');
    expect(del.request.method).toBe('DELETE');
    expect(patch.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(del.request.headers.get('Authorization')).toBe('Bearer test-token');
    patch.flush({});
    del.flush({});
  });

  it('ändert den Bestand über eine GraphQL-Mutation mit Variablen', () => {
    api.updateEventStock('12', 40).subscribe();
    const req = http.expectOne(`${BASE}/graphql`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query).toContain('updateStock');
    expect(req.request.body.variables).toEqual({ id: '12', stock: 40 });
    req.flush({ data: {} });
  });

  it('ändert Rollen nur über den dafür vorgesehenen Pfad', () => {
    api.updateUserRole(5, 'organizer').subscribe();
    const req = http.expectOne(`${BASE}/api/users/5/role`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: 'organizer' });
    req.flush({});
  });

  it('kodiert die Adresssuche in der URL', () => {
    api.searchAddress('Hauptstraße 1 & Co').subscribe();
    const req = http.expectOne(`${BASE}/api/geocode?q=Hauptstra%C3%9Fe%201%20%26%20Co`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush([]);
  });
});
