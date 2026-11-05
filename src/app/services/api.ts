// Erstfassung mit KI erstellt (Gemini, KI-Log W3, 13.10.). Weiterentwickelt mit KI (KI-Log W6), jeweils vom Team getestet und bewertet: API-Pfad nach dem Deployment korrigiert (Robert, 14.10.); Check-in entfernt (Robert, 15.10.); API-URL für die Adresssuche (Manuel, 15.10.); Admin-Login angebunden (Robert, 26.10.); API-Adresse nach config.ts ausgelagert (Claude, KI-Log Nr. 30, 05.11.).
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { API_URL } from '../config';

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = API_URL;

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/events`);
  }

  getEventsViaGraphQL(): Observable<any> {
    const query = {
      query: `
        query {
          events {
            event_id
            title
            category
            location
            event_date
            price
            event_stock
            logo_url
            description
            latitude
            longitude
          }
        }
      `
    };
    return this.http.post<any>(`${this.apiUrl}/graphql`, query, {
      headers: this.getAuthHeaders()
    });
  }

  updateEventStock(eventId: string, newStock: number): Observable<any> {
    const mutation = {
      query: `
        mutation($id: ID!, $stock: Int!) {
          updateStock(eventId: $id, stock: $stock) {
            event_id
            event_stock
          }
        }
      `,
      variables: {
        id: eventId,
        stock: newStock
      }
    };
    return this.http.post<any>(`${this.apiUrl}/graphql`, mutation, {
      headers: this.getAuthHeaders()
    });
  }

  createEvent(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/events`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  updateEvent(id: number | string, payload: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/events/${id}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  deleteEvent(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/events/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getUsers(): Observable<UserItem[]> {
    return this.http.get<UserItem[]>(`${this.apiUrl}/api/users`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/api/users/${userId}/role`,
      { role },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  checkInTicket(ticketCode: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/api/tickets/check-in`,
      { ticketCode },
      { headers: this.getAuthHeaders() }
    );
  }
  searchAddress(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/geocode?q=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders()
    });
  }
}