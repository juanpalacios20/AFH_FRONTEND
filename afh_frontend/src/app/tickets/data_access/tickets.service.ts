import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { Observable, tap } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class TicketsService extends BaseHttpService {

  headers: HttpHeaders;

  constructor(private cookieService: CookieService) {
    super();
    this.headers = new HttpHeaders({
      'Authorization': `Token ${this.cookieService.get('token')}`,
      'Content-Type': 'application/json'
    });
  }

  addTicket(
    tools: Number[],
    description: string,
    email: string,
    place: string
  ): Observable<any> {
    const body = {
      tools,
      description,
      email,
      place,
    };

    return this.http
      .post(`${this.apiUrl}ticket/addticket/`, body, { headers: this.headers })
      .pipe(tap((response: any) => {}));
  }

  getTickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}ticket/tickets/`, {
      headers: this.headers,
    });
  }
  getTicket(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}ticket/ticket/${id}`, {
      headers: this.headers,
    });
  }

  changeState(id: number, status: number): Observable<any> {
    const body = {
      id,
      status,
    };

    return this.http
      .patch(`${this.apiUrl}ticket/changestate/`, body, {
        headers: this.headers,
      })
      .pipe(tap((response: any) => {}));
  }

  getPDF(ticketId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}ticket/getpdf/${ticketId}`, {
      headers: this.headers,
      observe: 'response',
      responseType: 'blob',
    });
  }

  getInfo(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}ticket/getinforme/`, {
      headers: this.headers,
      observe: 'response',
      responseType: 'blob',
    });
  }
}
