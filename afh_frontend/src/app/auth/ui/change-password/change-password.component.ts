import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../shared/auth/data_access/auth.service';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-change-password',
  imports: [FloatLabel, ButtonModule, RouterLink, FormsModule, InputTextModule, PasswordModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  email: string = '';
  newPassword: string = '';
  mensaje: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router,  private cookieService: CookieService) {}

  changePassword() {
    this.email = this.cookieService.get('resetEmail');
    const token = this.cookieService.get('resetToken');
    if (!this.email) {
      this.errorMessage = "No se encontró el correo. Por favor, vuelve a enviar el código.";
      return;
    }

    this.authService.changePassword(this.email, this.newPassword, token).subscribe({
      next: (res) => {
        this.mensaje = res.message;
        this.cookieService.delete('resetEmail');
        this.cookieService.delete('resetToken');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Error al cambiar la contraseña, verifique los parametros';
      }
    });
  }
}
