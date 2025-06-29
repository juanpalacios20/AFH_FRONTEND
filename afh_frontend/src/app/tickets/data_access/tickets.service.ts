import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { Observable, tap } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class TicketsService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  addTicket(
    tools: Number[],
    description: string,
    email: string,
    place: string,
    responsible: string
  ): Observable<any> {
    const body = {
      tools,
      description,
      email,
      place,
      responsible
    };

    const headers = this.getHeaders();

    return this.http
      .post(`${this.apiUrl}ticket/addticket/`, body, { headers: headers })
      .pipe(tap((response: any) => {}));
  }

  getTickets(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}ticket/tickets/`, {
      headers: headers,
    });
  }
  getTicket(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}ticket/ticket/${id}`, {
      headers: headers,
    });
  }

  changeState(id: number, status: number): Observable<any> {
    const body = {
      id,
      status,
    };

    const headers = this.getHeaders();

    return this.http
      .patch(`${this.apiUrl}ticket/changestate/`, body, {
        headers: headers,
      })
      .pipe(tap((response: any) => {}));
  }

  getPDF(ticketId: number): Observable<HttpResponse<Blob>> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}ticket/getpdf/${ticketId}`, {
      headers: headers,
      observe: 'response',
      responseType: 'blob',
    });
  }

  getInfo(): Observable<HttpResponse<Blob>> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}ticket/getinforme/`, {
      headers: headers,
      observe: 'response',
      responseType: 'blob',
    });
  }
}
