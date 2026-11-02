// Mit KI erstellt (KI-Log Nr. 26): Laden, Suche, Sortierung, Seiten und Formular der Eventverwaltung.
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Events, EventData } from './events';
import { ApiService } from '../../services/api';

function ev(id: number, title: string, price: number, extra: Partial<EventData> = {}): EventData {
  return { event_id: id, title, price, event_stock: 100, location: 'Mosbach', category: 'Konzerte', ...extra };
}

describe('Events', () => {
  let api: Record<string, ReturnType<typeof vi.fn>>;

  async function create(): Promise<Events> {
    TestBed.configureTestingModule({
      imports: [Events],
      providers: [{ provide: ApiService, useValue: api }]
    });
    const fixture = TestBed.createComponent(Events);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    api = {
      getEventsViaGraphQL: vi.fn(() => of({ data: { events: [ev(1, 'Rock am Ring', 89), ev(2, 'Jazz Abend', 25)] } })),
      getEvents: vi.fn(() => of([])),
      createEvent: vi.fn(() => of({})),
      updateEvent: vi.fn(() => of({})),
      deleteEvent: vi.fn(() => of({})),
      updateEventStock: vi.fn(() => of({})),
      searchAddress: vi.fn(() => of([]))
    };
  });

  it('lädt die Events über GraphQL und übernimmt den Bestand ins Eingabefeld', async () => {
    const c = await create();
    expect(api['getEventsViaGraphQL']).toHaveBeenCalled();
    expect(c.isLoading()).toBe(false);
    expect(c.rawEvents().map(e => e.newStock)).toEqual([100, 100]);
  });

  it('weicht auf REST aus, wenn GraphQL fehlschlägt', async () => {
    api['getEventsViaGraphQL'].mockReturnValue(throwError(() => new Error('GraphQL down')));
    api['getEvents'].mockReturnValue(of([ev(9, 'Fallback', 10)]));
    const c = await create();
    expect(api['getEvents']).toHaveBeenCalled();
    expect(c.rawEvents()[0].title).toBe('Fallback');
  });

  it('meldet einen Fehler, wenn auch REST fehlschlägt', async () => {
    api['getEventsViaGraphQL'].mockReturnValue(throwError(() => new Error('a')));
    api['getEvents'].mockReturnValue(throwError(() => new Error('Netzwerkfehler')));
    const c = await create();
    expect(c.isLoading()).toBe(false);
    expect(c.statusMessage()).toContain('Netzwerkfehler');
  });

  it('filtert nach Titel, Ort und Kategorie ohne Groß- und Kleinschreibung', async () => {
    const c = await create();
    c.searchQuery.set('JAZZ');
    expect(c.filteredEvents().map(e => e.event_id)).toEqual([2]);
    c.searchQuery.set('mosbach');
    expect(c.filteredEvents().length).toBe(2);
  });

  it('sortiert nach Preis numerisch und dreht die Richtung beim zweiten Klick', async () => {
    const c = await create();
    c.changeSort('price');
    expect(c.filteredEvents().map(e => e.price)).toEqual([25, 89]);
    c.changeSort('price');
    expect(c.filteredEvents().map(e => e.price)).toEqual([89, 25]);
  });

  it('teilt die Liste in Seiten zu acht Einträgen und ignoriert ungültige Seiten', async () => {
    api['getEventsViaGraphQL'].mockReturnValue(
      of({ data: { events: Array.from({ length: 10 }, (_, i) => ev(i + 1, `Event ${i + 1}`, 10)) } })
    );
    const c = await create();
    expect(c.totalPages()).toBe(2);
    expect(c.pagedEvents().length).toBe(8);
    c.setPage(2);
    expect(c.pagedEvents().length).toBe(2);
    c.setPage(3);
    expect(c.currentPage()).toBe(2);
  });

  it('speichert kein Event ohne Titel', async () => {
    const c = await create();
    c.openCreateModal();
    c.saveModalForm();
    expect(api['createEvent']).not.toHaveBeenCalled();
  });

  it('legt ein neues Event an und lädt die Liste neu', async () => {
    const c = await create();
    c.openCreateModal();
    c.modalForm.update(f => ({ ...f, title: 'Neues Konzert', price: 30 }));
    c.saveModalForm();
    expect(api['createEvent']).toHaveBeenCalledWith(expect.objectContaining({ title: 'Neues Konzert', price: 30 }));
    expect(c.isModalOpen()).toBe(false);
    expect(api['getEventsViaGraphQL']).toHaveBeenCalledTimes(2);
  });

  it('aktualisiert ein bestehendes Event statt ein neues anzulegen', async () => {
    const c = await create();
    c.openEditModal(c.rawEvents()[0]);
    c.saveModalForm();
    expect(api['updateEvent']).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Rock am Ring' }));
    expect(api['createEvent']).not.toHaveBeenCalled();
  });

  it('übernimmt Koordinaten aus dem Adressvorschlag als Zahlen', async () => {
    const c = await create();
    c.selectAddress({ display_name: 'Lohrtalweg 10, Mosbach', lat: '49.35', lon: '9.15' });
    expect(c.modalForm()).toEqual(expect.objectContaining({ address: 'Lohrtalweg 10, Mosbach', latitude: 49.35, longitude: 9.15 }));
  });

  it('löscht nur nach Bestätigung', async () => {
    const c = await create();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    c.deleteEvent(1);
    expect(api['deleteEvent']).not.toHaveBeenCalled();
    c.deleteEvent(1);
    expect(api['deleteEvent']).toHaveBeenCalledWith(1);
    confirmSpy.mockRestore();
  });
});
