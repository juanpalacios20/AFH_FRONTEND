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
        this.cookieService.set('token', response.token, 1, '/');
        this.cookieService.set('csrf_token', response.csrf_token, 1, '/');
        this.cookieService.set('role', response.role, 1, '/');
        this.cookieService.set('email', email, 1, '/');
        this.authStatus.next(true);
      })
    );
  }
  logout(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Token ${this.cookieService.get('token')}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.post(`${this.apiUrl}auth/logout/`, {}, { headers }).pipe(
      tap(() => {
        this.cookieService.delete('token', '/');
        this.cookieService.delete('csrf_token', '/');
        this.cookieService.delete('role', '/');
        this.cookieService.delete('email', '/');
        this.authStatus.next(false);
      }));
  }

  sendCode(email: string): Observable<any> {
    const body = { email };
    return this.http.post(`${this.apiUrl}reset/request/`, body).pipe(
      tap((response: any) => {
        if (response.Token) {
          this.cookieService.set('resetToken', response.Token); 
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
    return !!this.cookieService.get('token');
  }  

  whoIs(): boolean {
    if (this.cookieService.get('role') === "1") {
      return true;
    }
    return false;
  }

  getAuthStatus(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  isLoggedIn(): boolean {
    const token = this.cookieService.get('token');
    if (token) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
}

}
