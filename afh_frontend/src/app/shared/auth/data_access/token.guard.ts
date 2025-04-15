import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TokenGuard implements CanActivate {

  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean {
    const token = localStorage.getItem('resetToken'); 

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
