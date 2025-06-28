import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderWorkService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getOrders() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/workorder/workorders/`, {
      headers,
    });
  }

  finishOrderWork(id: number) {
    const headers = this.getHeaders();
    return this.http.patch<any>(`${this.apiUrl}/workorder/finish/${id}/`, {
      headers,
    });
  }

  workOrderPdf(id: number) {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/workorder/pdf/${id}/`, {
      headers: headers,
      observe: 'response',
      responseType: 'blob',
    });
  }

  createWorkOrder(data: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/workorder/create/`, data, {
      headers,
    });
  }

  updateOrderWork(data: any, id: Number) {
    const headers = this.getHeaders();
    return this.http.patch<any>(`${this.apiUrl}/workorder/update/${id}/`, data, {
      headers,
    });
  }

  getQuotesWithoutOrder() {
    return this.http.get<any>(`${this.apiUrl}/quote/getquoteswhitouthorder/`);
  }
}
