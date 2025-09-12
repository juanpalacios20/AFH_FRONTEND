import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CostService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getCosts() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}costs/get/`, { headers });
  }

  createCosts(data: any) {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}costs/add/`, data, {
      headers: headers,
    });
  }

  editCost(data: any, id: number) {
    const headers = this.getHeaders();
    return this.http.patch(`${this.apiUrl}/costs/update/${id}/`, data, {
      headers: headers,
    });
  }
}
