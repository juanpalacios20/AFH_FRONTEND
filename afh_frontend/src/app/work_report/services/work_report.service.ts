import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WorkReportService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getWorkReports() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/deliverycertificate/get/`, { headers });
  }

  createWorkReport(workReport: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/deliverycertificate/create/`, workReport, { headers });
  }

  createExhibit(exhibit: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/exhibit/create/`, exhibit, { headers });
  }

}
