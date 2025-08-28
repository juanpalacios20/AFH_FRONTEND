import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  createClient(
    name: string,
    email: string,
    phone: string,
    post: string,
    representative: string
  ): Observable<any> {
    const headers = this.getHeaders();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('post', post);
    formData.append('representative', representative);

    return this.http
      .post(`${this.apiUrl}customer/addcustomer/`, formData, {
        headers: headers,
      })
      .pipe(tap((response: any) => {}));
  }

  updateClient(id: number, formData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .put(`${this.apiUrl}customer/updatecustomer/${id}`, formData, {
        headers: headers,
      })
      .pipe(tap((response: any) => {}));
  }

  getClients(): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .get(`${this.apiUrl}customer/getcustomers/`, { headers: headers })
      .pipe(tap((response: any) => {}));
  }

  deleteClient(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .delete(`${this.apiUrl}customer/delete/${id}`, { headers: headers })
      .pipe(tap((response: any) => {}));
  }
}
