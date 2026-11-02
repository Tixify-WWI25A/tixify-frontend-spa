// Mit KI erstellt (KI-Log Nr. 26): Anmeldung nur für Admins und Veranstalter.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Login } from './login';
import { AuthService } from '../../services/auth';

const LOGIN_URL = 'https://tixify-c7a903638236.herokuapp.com/api/auth/login';

describe('Login', () => {
  let http: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let c: Login;

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: Router, useValue: router }]
    });
    http = TestBed.inject(HttpTestingController);
    c = TestBed.createComponent(Login).componentInstance;
  });

  afterEach(() => http.verify());

  it('verlangt E-Mail und Passwort, bevor eine Anfrage rausgeht', () => {
    c.email = 'admin@tixify.de';
    c.onLogin();
    expect(c.errorMessage()).toBe('Bitte E-Mail und Passwort eingeben.');
    http.expectNone(LOGIN_URL);
  });

  it('leitet Admins nach erfolgreicher Anmeldung zum Dashboard', () => {
    c.email = 'admin@tixify.de';
    c.password = 'geheim123';
    c.onLogin();
    const req = http.expectOne(LOGIN_URL);
    expect(req.request.body).toEqual({ email: 'admin@tixify.de', password: 'geheim123' });
    req.flush({ token: 't', user: { email: 'admin@tixify.de', role: 'admin' } });

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(true);
  });

  it('weist Kunden ab und meldet sie sofort wieder ab', () => {
    c.email = 'kunde@tixify.de';
    c.password = 'geheim123';
    c.onLogin();
    http.expectOne(LOGIN_URL).flush({ token: 't', user: { email: 'kunde@tixify.de', role: 'customer' } });

    expect(c.errorMessage()).toContain('Zugriff verweigert');
    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('zeigt die Fehlermeldung des Servers bei falschen Zugangsdaten', () => {
    c.email = 'admin@tixify.de';
    c.password = 'falsch';
    c.onLogin();
    http.expectOne(LOGIN_URL).flush({ error: 'E-Mail oder Passwort falsch' }, { status: 401, statusText: 'Unauthorized' });

    expect(c.isLoading()).toBe(false);
    expect(c.errorMessage()).toBe('E-Mail oder Passwort falsch');
  });
});
