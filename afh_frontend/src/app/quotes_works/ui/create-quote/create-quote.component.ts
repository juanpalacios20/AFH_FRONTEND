import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-create-quote',
  imports: [
    Dialog,
    ButtonModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    CommonModule,
    ToastModule,
    MultiSelectModule,
    TextareaModule,
    NgIf
  ],
  templateUrl: './create-quote.component.html',
  styleUrl: './create-quote.component.css',
})
export default class CreateQuoteComponent implements OnInit {
  actionTittle: string = 'Crear';
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onQuoteCreated = new EventEmitter<void>();


  close() {
    this.visible = false;
    this.closeDialog.emit();
  }
  
  ngOnInit() {
    if (this.action === 1) {
      this.actionTittle = 'Editar cotización';
    } else {
      this.actionTittle = 'Crear cotización';
    }
  }
}
