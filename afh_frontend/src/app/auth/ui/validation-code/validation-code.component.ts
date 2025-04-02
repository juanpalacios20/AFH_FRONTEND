import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputOtp } from 'primeng/inputotp';
import { AuthService } from '../../../shared/auth/data_access/auth.service';

@Component({
  selector: 'app-validation-code',
  imports: [ButtonModule, FormsModule, InputTextModule, InputOtp],
  templateUrl: './validation-code.component.html',
  styleUrl: './validation-code.component.css'
})
export class ValidationCodeComponent {
  code: string  = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  verifyCode() {
    console.log('Email:', this.code);
    this.authService.verifyCode(this.code).subscribe({
      next: () => this.router.navigate(['/change-password']),
      error: (err) => this.errorMessage = "Error de inicio de sesión. Por favor, verifica tu correo.",
    });
  }string = '';
}
