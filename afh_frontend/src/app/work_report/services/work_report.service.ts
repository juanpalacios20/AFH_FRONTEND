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
    return this.http.get<any>(`${this.apiUrl}/deliverycertificate/get/`, {
      headers,
    });
  }

  createWorkReport(workReport: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiUrl}/deliverycertificate/create/`,
      workReport,
      { headers }
    );
  }

  createExhibit(data: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/exhibit/create/`, data, {
      headers,
    });
  }

  updateExhibit(data: any, id: number) {
    const headers = this.getHeaders();
    return this.http.patch<any>(`${this.apiUrl}/exhibit/update/${id}/`, data, {
      headers,
    });
  }

  deleteExhibit(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/exhibit/delete/${id}/`);
  }

  updateWorkReport(data: any, id: number) {
    const headers = this.getHeaders();
    return this.http.patch<any>(
      `${this.apiUrl}/deliverycertificate/update/${id}/`,
      data,
      {
        headers,
      }
    );
  }

  addExhibitToWorkReport(delivery_certificate_id: number, exhibit_id: number) {
    const headers = this.getHeaders();
    return this.http.patch<any>(
      `${this.apiUrl}/deliverycertificate/add-exhibit/${delivery_certificate_id}/${exhibit_id}/`,
      {
        headers,
      }
    );
  }

  workReportPdf(id: number) {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/deliverycertificate/pdf/${id}/`, {
      headers: headers,
      observe: 'response',
      responseType: 'blob',
    });
  }
}
