import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/auth/data_access/auth.service';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    InputTextModule,
    FloatLabel,
    PasswordModule,
    ButtonModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  navigateTo = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookiesService: CookieService
  ) {}

  login() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
  
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        const role = this.cookiesService.get('role');
        console.log('Role:', role);
        console.log('Token:', this.cookiesService.get('token'));
  
        if (role === '1') {
          this.navigateTo = '/management-tools';
        } else {
          this.navigateTo = '/management-vales';
        }
  
        console.log('Navigate to:', this.navigateTo);
  
        this.router.navigate([this.navigateTo]).then(() => {
          this.navigateTo = '';
        });
      },
      error: (err) => {
        this.errorMessage = "Error de inicio de sesión. Por favor, verifica tus credenciales.";
      },
    });
  }
  
}
