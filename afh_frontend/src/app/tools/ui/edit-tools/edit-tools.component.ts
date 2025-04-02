import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';

interface State {
  name: string;
}

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-edit-tools',
  imports: [
    Dialog,
    ButtonModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    CommonModule,
    Select,
    FileUpload,
    ToastModule,
  ],
  templateUrl: './edit-tools.component.html',
  styleUrl: './edit-tools.component.css',
})
export class EditToolsComponent {
  states: State[] | undefined;
  
    selectedState: State | undefined;
  
    constructor(private messageService: MessageService) {}
  
    @Input() visible: boolean = false;
    @Input() tool: any = {}; // Herramienta a editar
    @Output() closeDialog = new EventEmitter<void>();
  
    saveChanges() {
      // Aquí puedes manejar la actualización de la herramienta
      console.log('Herramienta actualizada:', this.tool);
      this.closeDialog.emit(); // Cierra el diálogo después de guardar
    }
  
    onUpload(event: any): void {
      const uploadEvent = event as UploadEvent;
      this.messageService.add({
        severity: 'info',
        summary: 'Success',
        detail: 'File Uploaded with Basic Mode',
      });
    }
  
    ngOnInit() {
      this.states = [
        { name: 'ACTIVO' },
        { name: 'INACTIVO' },
        { name: 'EN USO' },
      ];
    }
}
