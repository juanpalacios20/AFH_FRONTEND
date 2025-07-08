import { CookieService } from "ngx-cookie-service";
import { BaseHttpService } from "../../shared/data_access/base_http.service";
import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class FinanceService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getIncomes(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}income/Income/`, { headers: headers })
  }

  getEgress(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}egress/Egress/`, { headers: headers })
  }
}