import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class progressOrderService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    console.log('token', this.cookieService.get('token'));
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getProgress() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}workprogress/get_all/`, {
      headers,
    });
  }

  getProgressById(id: number) {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}workprogress/get/${id}`, {
      headers,
    });
  }

  advanceToProgress(idAdvance: number, idProgress: number) {
    const headers = this.getHeaders();
    console.log('headers', headers);
    return this.http.put(
      `${this.apiUrl}workprogress/add/${idProgress}/${idAdvance}/`,
      {}, 
      { headers }
    );
  }

  changeState(id: number, data: any) {
    const headers = this.getHeaders();
    return this.http.put(
      `${this.apiUrl}workprogress/change_status/${id}/`,
      data,
      {
        headers,
      }
    );
  }

  changePercentage(id: number, data: any) {
    const headers = this.getHeaders();
    return this.http.put(
      `${this.apiUrl}workprogress/change_percentage/${id}/`,
      data,
      {
        headers,
      }
    );
  }
}
