import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../shared/auth/data_access/auth.service';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-send-code',
  imports: [FloatLabel, ButtonModule, RouterLink, FormsModule, InputTextModule, CommonModule],
  templateUrl: './send-code.component.html',
  styleUrl: './send-code.component.css'
})
export class SendCodeComponent {
  email: string = '';
  errorMessage: string = '';

   constructor(private authService: AuthService, private router: Router, private cookieService: CookieService) {}

   sendCode() {
    console.log('Email:', this.email);
    this.authService.sendCode(this.email).subscribe({
      next: (response) => {
        this.cookieService.set('resetEmail', this.email, 1, '/');
        this.cookieService.set('resetToken', response.Token, 1, '/');
        this.router.navigate(['/validation-code']);
      },
      error: (err) => this.errorMessage = "Error de inicio de sesión. Por favor, verifica tu correo.",
    });
}


}
