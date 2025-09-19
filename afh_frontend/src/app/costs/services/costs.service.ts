import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  getCostsWithoutCosts() {
    const headers = this.getHeaders();
    return this.http.get<any>(
      `${this.apiUrl}workorder/getworkorderwhitoutcosts/`,
      { headers }
    );
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

  downloadPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/costs/generate-pdf/${id}/`, {
      responseType: 'blob',
    });
  }
}
