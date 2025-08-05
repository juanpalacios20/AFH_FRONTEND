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
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getProgress() {
    return this.http.get<any>(`${this.apiUrl}workprogress/get_all/`, {
      headers: this.getHeaders(),
    });
  }

  getProgressById(id: number) {
    return this.http.get<any>(`${this.apiUrl}workprogress/get/${id}`, {
      headers: this.getHeaders(),
    });
  }

  advanceToProgress(idAdvance: number, idProgress: number) {
    return this.http.put(
      `${this.apiUrl}workprogress/add/${idProgress}/${idAdvance}/`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  changeState(id: number, data: any) {
    return this.http.put(
      `${this.apiUrl}workprogress/change_status/${id}/`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
  }

  changePercentage(id: number, data: any) {
    return this.http.put(
      `${this.apiUrl}workprogress/change_percentage/${id}/`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
  }
}
