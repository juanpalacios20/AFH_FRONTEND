import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/auth/data_access/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, InputTextModule, FloatLabel, PasswordModule, ButtonModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/management-tools']),
      error: (err) => this.errorMessage = "Error de inicio de sesión. Por favor, verifica tus credenciales.",
    });
  }string = '';

  
}
