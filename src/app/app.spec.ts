// Mit KI überarbeitet (KI-Log Nr. 26): ersetzt den Standardtest des Angular-Grundgerüsts.
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();
  });

  it('zeigt den Studienhinweis auf jeder Seite', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.study-banner')?.textContent).toContain('kein echter Ticketverkauf');
  });

  it('blendet die Navigation ohne Anmeldung aus', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.sidebar')).toBeNull();
  });

  it('zeigt angemeldeten Admins die Navigation und meldet sie ab', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    app.auth.setSession('t', { name: 'Robert', role: 'admin' });
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sidebar')).not.toBeNull();
    expect(el.querySelectorAll('.nav-links a').length).toBe(3);

    app.onLogout();
    expect(app.auth.isLoggedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
