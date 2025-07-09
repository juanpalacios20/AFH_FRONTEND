import { CookieService } from 'ngx-cookie-service';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FinanceService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getIncomes(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}income/Income/`, { headers: headers });
  }

  getEgress(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}egress/Egress/`, { headers: headers });
  }

  createIncomes(income: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/income/add/`, income, {
      headers: headers,
    });
  }

  createEgress(extense: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}egress/add/`, extense, {
      headers: headers,
    });
  }

  updateIncomes(incomesToEdit: any, incomeId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch(`${this.apiUrl}income/update/${incomeId}`, incomesToEdit, {
      headers: headers,
    });
  }

  updateEgress(extenseToEdit: any, extenseId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch(`${this.apiUrl}egress/update/${extenseId}`, extenseToEdit, {
      headers: headers,
    });
  }
}
