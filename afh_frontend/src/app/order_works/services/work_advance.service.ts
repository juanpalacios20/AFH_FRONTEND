import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpHeaders } from '@angular/common/http';
import { WorkAdvanceResponse } from '../../interfaces/models';
import { Observable } from 'rxjs';
import { InputNumberDesignTokens } from '@primeng/themes/types/inputnumber';

@Injectable({
  providedIn: 'root',
})
export class workAdvanceService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  createWorkAdvance(data: any): Observable<WorkAdvanceResponse> {
    return this.http.post<WorkAdvanceResponse>(
      `${this.apiUrl}workadvance/add/`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
  }

  updateWorkAdvance(data: any, id: number) {
    return this.http.patch(
      `${this.apiUrl}workadvance/update/${id}`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getAdvanceById(id: number) {
    return this.http.get<any>(`${this.apiUrl}workadvance/get/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
