import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputOtp } from 'primeng/inputotp';

@Component({
  selector: 'app-validation-code',
  imports: [ButtonModule, RouterLink, FormsModule, InputTextModule, InputOtp],
  templateUrl: './validation-code.component.html',
  styleUrl: './validation-code.component.css'
})
export class ValidationCodeComponent {
  code: string  = '';
}
