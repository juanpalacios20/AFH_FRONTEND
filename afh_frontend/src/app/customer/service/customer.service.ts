import { Injectable } from "@angular/core";
import { BaseHttpService } from "../../shared/data_access/base_http.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable, tap } from "rxjs";
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService extends BaseHttpService{
    constructor(private cookieService: CookieService) {
        super();
    } 

    loginCustomer(email: string, code: string): Observable<any>{
        const formData = new FormData();
        
        formData.append('email', email);
        formData.append('code', code);

        console.log(formData);
        return this.http.post(`${this.apiUrl}workprogress/validate_customer/`, formData, {
        }).pipe(tap((response: any) => {
            this.cookieService.set('id', response.id, 1, '/');
        }))
    }
}