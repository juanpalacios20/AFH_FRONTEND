import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClass } from 'primeng/styleclass';
import { Drawer } from 'primeng/drawer';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/data_access/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
}



@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    DrawerModule,
    ButtonModule,
    Ripple,
    AvatarModule,
    StyleClass,
    RouterLink,
    NgFor
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  isAdmin: boolean = false;
  @ViewChild('drawerRef') drawerRef!: Drawer;
  @Input() visible: boolean = false;
  menuSections: { label: string; icon: string; visible: boolean; items: MenuItem[] }[] = [
    {
      label: 'Secciones',
      icon: 'pi pi-chevron-down',
      visible: true, //this.isAdmin, // Solo admins
      items: [
        {
          label: 'Herramientas',
          icon: 'pi pi-hammer',
          route: '/management-tools',
        },
        { label: 'Clientes', icon: 'pi pi-users', route: '/clients' },
        { label: 'Finanzas', icon: 'pi pi-wallet', route: '/finance' },
        { label: 'Reportes', icon: 'pi pi-chart-bar', route: '/reports' },
      ],
    },
    {
      label: 'Gestión de Vales',
      icon: 'pi pi-chevron-down',
      visible: true,
      items: [
        { label: 'Vales', icon: 'pi pi-clipboard', route: '/management-vales' },
        {
          label: 'Historial Vales',
          icon: 'pi pi-clipboard',
          route: '/history-tickets',
        },
      ],
    },
    {
      label: 'Gestión de Ordenes de Trabajo',
      icon: 'pi pi-chevron-down',
      visible: true,
      items: [
        { label: 'Cotizaciones', icon: 'pi pi-clipboard', route: '/quotes' },
        {
          label: 'Ordenes de Trabajo',
          icon: 'pi pi-clipboard',
          route: '/management-orders-works',
        },
        {
          label: 'Actas de entrega',
          icon: 'pi pi-clipboard',
          route: '/work-report',
        },
      ],
    },
    {
      label: 'Más',
      icon: 'pi pi-chevron-down',
      visible: true,
      items: [
        {
          label: 'Cerrar Sesión',
          icon: 'pi pi-sign-out',
          action: () => this.logout(),
        },
      ],
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService
  ) {}

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

  get visibleSections() {
    return this.menuSections.filter((section) => section.visible);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.cookieService.delete('token');
        this.cookieService.delete('csrf_token');
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Error al cerrar sesión', err),
    });
  }
}
