import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Toolbar } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CookieService } from 'ngx-cookie-service';
import { WorkProgress } from '../../../interfaces/models';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  imports: [Toolbar, ButtonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  constructor(
    private cookiesService: CookieService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ){

  }
  @Input() name: string = '';

  logout(){
        this.cookiesService.delete('id', '/');
        this.router.navigate(['/login-customer']).then(() => {
            this.cdRef.detectChanges();
        });
    }
}
