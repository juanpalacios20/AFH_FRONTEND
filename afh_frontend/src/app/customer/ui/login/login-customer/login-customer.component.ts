import { Component } from '@angular/core';
import { FocusTrapModule } from 'primeng/focustrap';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AutoFocusModule } from 'primeng/autofocus';
import { CustomerService } from '../../../service/customer.service';
import { Router } from '@angular/router';
import { Toast } from 'primeng/toast';
import { Ripple } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login-customer',
  imports: [FocusTrapModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    AutoFocusModule,
    Toast,
    Ripple],

  providers: [MessageService],

  templateUrl: './login-customer.component.html',
  styleUrl: './login-customer.component.css'
})
export class LoginCustomerComponent {
  code: string = '';
  email: string = '';
  loading: boolean = false;
  errorMessage = '';


  constructor(
    private customerService: CustomerService,
    private router: Router,
    private messageService: MessageService,
    private cookiesService: CookieService
  ) { }

  showWarn() {
    this.messageService.add({ severity: 'warn', summary: 'Error de inicio de sesión', detail: this.errorMessage });
  }


  login() {
    this.loading = true;

    this.customerService.loginCustomer(this.email, this.code).subscribe({
      next: () => {
        this.router.navigate(['/home-customer']).then(() => {
          this.loading = false;
        })
      }, error: (err) => {
        console.error('Error during customer login:', err);
        this.errorMessage = "Por favor, verifica tus credenciales.";
        this.showWarn();
        this.loading = false;
      }
    })
  }
}
