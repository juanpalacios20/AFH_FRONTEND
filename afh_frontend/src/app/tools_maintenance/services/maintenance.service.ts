import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpHeaders } from '@angular/common/http';
import { MaintenanceData, ToolsMaintenance } from '../../interfaces/models';
import { Data } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ToolsMaintenanceService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getToolsMainenance() {
    return this.http.get<ToolsMaintenance[]>(`${this.apiUrl}maintenance/get/`);
  }

  createToolMaintenance(data: any) {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}maintenance/add/`, data, {
      headers: headers,
    });
  }

  editMaintenance(data: any, id: number) {
    const headers = this.getHeaders();
    return this.http.patch(`${this.apiUrl}maintenance/update/${id}/`, data, {
      headers: headers,
    });
  }

  pdfMaintenance(maintenance_id: number) {
    const headers = this.getHeaders();

    return this.http.get(
      `${this.apiUrl}maintenance/get_pdf/${maintenance_id}/`,
      {
        headers: headers,
        observe: 'response',
        responseType: 'blob',
      }
    );
  }

  finishMaintenance(maintenance_id: number) {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}maintenance/end/${maintenance_id}/`, {
      headers: headers,
    });
  }
}
