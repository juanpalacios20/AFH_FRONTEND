import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class QuoteService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getQuotes() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/quote/getquotes/`, { headers });
  }

  createItem(item: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/item/additem/`, item, { headers });
  }

  createOption(option: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/option/addoption/`, option, { headers });
  }

  createQuote(quote: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/quote/addquote/`, quote, { headers });
  }
}
