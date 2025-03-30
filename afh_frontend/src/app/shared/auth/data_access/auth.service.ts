import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { BaseHttpService } from '../../data_access/base_http.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseHttpService {
  private authStatus = new BehaviorSubject<boolean>(false);
    router: any;

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}auth/login/`, body).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('csrf_token', response.csrf_token);
        localStorage.setItem('role', response.role);
        this.authStatus.next(true); // Cambia el estado a autenticado
      })
    );
  }
  logout(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Token ${localStorage.getItem('token')}`, // Obtener el token del localStorage
      'Content-Type': 'application/json'
    });
  
    return this.http.post(`${this.apiUrl}auth/logout/`, {}, { headers });
  }

  sendCode(email: string): Observable<any> {
    const body = { email };
    return this.http.post(`${this.apiUrl}reset/request/`, body).pipe(
      tap((response: any) => {
        console.log('Código de verificación enviado:', response);
        if (response.Token) {
          localStorage.setItem('resetToken', response.Token);  // Guarda el token
        }
      })
    );
}


  verifyCode(code: string): Observable<any> {
    const body = { code };
    return this.http.post(`${this.apiUrl}reset/validate/`, body).pipe(
      tap((response: any) => {
        console.log('Código de verificación verificado:', response);
      })
    );
  } 

  changePassword(email: string, newPassword: string, token: string): Observable<any> {
    console.log(token, email, newPassword);
    if (!token) {
      throw new Error('Token no encontrado en el localStorage');
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });

    const body = { email, new_password: newPassword };
    
    return this.http.post(`${this.apiUrl}reset/reset/`, body, { headers });
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token'); // Si hay un token, está autenticado
  }  

  // Observable para detectar cambios en la autenticación
  getAuthStatus(): Observable<boolean> {
    return this.authStatus.asObservable();
  }
}
