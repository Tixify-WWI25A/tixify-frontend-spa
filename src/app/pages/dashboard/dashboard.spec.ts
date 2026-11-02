// Mit KI erstellt (KI-Log Nr. 26): Kennzahlen des Dashboards.
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { ApiService } from '../../services/api';

describe('Dashboard', () => {
  async function create(response: any): Promise<Dashboard> {
    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), { provide: ApiService, useValue: { getEvents: () => response } }]
    });
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  it('berechnet Bestand, Warenwert, Durchschnittspreis und knappe Events', async () => {
    const c = await create(of([
      { title: 'A', price: '20.00', event_stock: 100, category: 'Konzerte' },
      { title: 'B', price: '40.00', event_stock: 10, category: 'Konzerte' },
      { title: 'C', price: '30.00', event_stock: 0, category: 'Theater' }
    ]));
    expect(c.totalEvents()).toBe(3);
    expect(c.totalStock()).toBe(110);
    expect(c.totalInventoryValue()).toBe(2400);
    expect(c.avgTicketPrice()).toBe(30);
    expect(c.lowStockEvents().map(e => e.title)).toEqual(['B', 'C']);
    expect(c.categoryDistribution()).toEqual([
      { name: 'Konzerte', count: 2, percent: 67 },
      { name: 'Theater', count: 1, percent: 33 }
    ]);
  });

  it('liefert Nullwerte ohne Events statt durch null zu teilen', async () => {
    const c = await create(of([]));
    expect(c.avgTicketPrice()).toBe(0);
    expect(c.totalInventoryValue()).toBe(0);
    expect(c.categoryDistribution()).toEqual([]);
  });

  it('beendet das Laden auch bei einem Serverfehler', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const c = await create(throwError(() => new Error('500')));
    expect(c.isLoading()).toBe(false);
    expect(c.events()).toEqual([]);
  });
});
