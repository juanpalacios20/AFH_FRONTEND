import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClass } from 'primeng/styleclass';
import { Drawer } from 'primeng/drawer';
import { Router, RouterLink} from '@angular/router';
import { AuthService } from '../../auth/data_access/auth.service';
import { NgIf } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [DrawerModule, ButtonModule, Ripple, AvatarModule, StyleClass, RouterLink, NgIf],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  isAdmin: boolean = false;
  @ViewChild('drawerRef') drawerRef!: Drawer;
  @Input() visible: boolean = false;

  constructor(private authService: AuthService, private router: Router, private cookieService: CookieService) {}

  ngOnInit() {
    this.isAdmin = this.authService.whoIs();
  }

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }

  toggleDrawer() {
    this.visible = !this.visible;
  }

  closeDrawer() {
    this.visible = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.cookieService.delete('token');
        this.cookieService.delete('csrf_token'); 
        this.router.navigate(['/login']); 
      },
      error: (err) => console.error('Error al cerrar sesión', err)
    });
  }
  
}
