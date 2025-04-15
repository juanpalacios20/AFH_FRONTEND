import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { BaseHttpService } from '../../data_access/base_http.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseHttpService {
  private authStatus = new BehaviorSubject<boolean>(false);
    router: any;

  constructor(private cookieService: CookieService) {
    super();
  }

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}auth/login/`, body).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('csrf_token', response.csrf_token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('email', email);
        this.authStatus.next(true);
      })      
    );
  }

  logout(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Token ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.post(`${this.apiUrl}auth/logout/`, {}, { headers }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('csrf_token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        this.authStatus.next(false);
      }));
  }

  sendCode(email: string): Observable<any> {
    const body = { email };
    return this.http.post(`${this.apiUrl}reset/request/`, body).pipe(
      tap((response: any) => {
        if (response.Token) {
          localStorage.setItem('resetToken', response.Token); 
        }
      })
    );
}


  verifyCode(code: string): Observable<any> {
    const body = { code };
    return this.http.post(`${this.apiUrl}reset/validate/`, body).pipe(
      tap((response: any) => {
      })
    );
  } 

  changePassword(email: string, newPassword: string, token: string): Observable<any> {
    if (!token) {
      throw new Error('Token no encontrado en las cookies');
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });

    const body = { email, new_password: newPassword };
    
    return this.http.post(`${this.apiUrl}reset/reset/`, body, { headers });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }  

  whoIs(): boolean {
    if (localStorage.getItem('role') === "1") {
      return true;
    }
    return false;
  }

  getAuthStatus(): Observable<boolean> {
    return this.authStatus.asObservable();
  }
}
