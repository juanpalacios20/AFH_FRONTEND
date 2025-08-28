import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CookieService } from 'ngx-cookie-service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../service/notification.service';
import { Popover, PopoverModule } from 'primeng/popover';
import { CommonModule } from '@angular/common';
import { Notification } from '../../../interfaces/models';
import { MessageService } from 'primeng/api';
import { LocalStorageService } from '../../../localstorage.service';

@Component({
  selector: 'app-toolbar',
  imports: [PopoverModule, ButtonModule, CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
  providers: [MessageService]
})
export class ToolbarComponent {
  constructor(
    private cookiesService: CookieService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private notification: NotificationService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService
  ) {

  }
  @Input() name: string = '';
  showMobileMenu = false;
  id_work_progress: number = 0;
  notifications: Notification[] = [];
  count: number = 0;
  @ViewChild('op') op!: Popover;
  @Output() noti = new EventEmitter<void>();


  ngOnInit() {
    this.notification.id_work_progress$.subscribe(value => {
      this.id_work_progress = value;
    });
    this.notification.suscribirse((this.id_work_progress).toString(), 'Nuevo avance registrado', (data) => {
        this.notifications.push({ title: data.title, content: data.content })
      this.count += 1
      this.cdRef.detectChanges()
      this.noti.emit();
    })
  }

  toggle(event: MouseEvent) {
    this.op.toggle(event);
  }

  logout() {
    this.cookiesService.delete('id', '/');
    this.router.navigate(['/login-customer']).then(() => {
      this.cdRef.detectChanges();
    });
    this.localStorageService.removeItem('work_progress');
  }


  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

}
