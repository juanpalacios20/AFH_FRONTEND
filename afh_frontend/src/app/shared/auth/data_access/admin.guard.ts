import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean {
    const role = this.cookieService.get('role');

    if (role === '1') {
      this.router.navigate(['/management-tools']);
      return false;
    } else if (role === '2') {
      this.router.navigate(['/management-tickets']);
      return false;
    }

    return true;
  }
}
