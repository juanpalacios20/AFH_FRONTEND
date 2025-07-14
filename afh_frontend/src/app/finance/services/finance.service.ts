import { CookieService } from 'ngx-cookie-service';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BalanceMonth, BalanceResponse } from '../../interfaces/models';

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
    return this.http.patch(
      `${this.apiUrl}income/update/${incomeId}`,
      incomesToEdit,
      {
        headers: headers,
      }
    );
  }

  updateEgress(extenseToEdit: any, extenseId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch(
      `${this.apiUrl}egress/update/${extenseId}`,
      extenseToEdit,
      {
        headers: headers,
      }
    );
  }
  fillMissingMonths(data: BalanceMonth[]): BalanceMonth[] {
    const allMonths = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];

    return allMonths.map((mes) => {
      const found = data.find((d) => d.mes === mes);
      return (
        found ?? {
          mes,
          ingresos: 500000000,
          egresos: 200000000,
          balance: 300000000,
        }
      );
    });
  }

  getBalanceMonthDates(start: string, end: string) {
    const headers = this.getHeaders();
    const params = new HttpParams().set('start', start).set('end', end);

    return this.http
      .get<BalanceMonth[]>(`${this.apiUrl}balans/get_balans_monthly/`, {
        headers: headers,
        params: params,
      })
      .pipe(map((response) => this.fillMissingMonths(response)));
  }

  getBalanceMonth(start: string, end: string) {
    const headers = this.getHeaders();
    const params = new HttpParams().set('start', start).set('end', end);

    return this.http.get<BalanceResponse>(`${this.apiUrl}balans/get/`, {
      headers: headers,
      params: params,
    });
  }
}
