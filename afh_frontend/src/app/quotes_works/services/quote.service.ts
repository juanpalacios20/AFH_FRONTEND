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

  deleteQuote(quoteId: number) {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/quote/delete/${quoteId}`, { headers });
  }

  getQuoteById(quoteId: number) {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/quote/getquote/${quoteId}`, { headers });
  }

  updateQuote(quoteId: number, quoteData: any) {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiUrl}/quote/updatequote/${quoteId}`, quoteData, { headers });
  }

  updateOption(optionId: number, optionData: any) {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiUrl}/option/updateoption/${optionId}`, optionData, { headers });
  }

  updateItem(itemId: number, itemData: any) {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiUrl}/item/updateitem/${itemId}`, itemData, { headers });
  }
}
