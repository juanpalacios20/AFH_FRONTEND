import { Component, Input, ViewChild } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClass } from 'primeng/styleclass';
import { Drawer } from 'primeng/drawer';
import { Router, RouterLink} from '@angular/router';
import { AuthService } from '../../auth/data_access/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [DrawerModule, ButtonModule, Ripple, AvatarModule, StyleClass, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;
  @Input() visible: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

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
        localStorage.removeItem('token'); // Eliminar el token del localStorage
        localStorage.removeItem('csrf_token'); // Eliminar CSRF token si es necesario
        this.router.navigate(['/login']); // Redirigir al login
      },
      error: (err) => console.error('Error al cerrar sesión', err)
    });
  }
  
}
