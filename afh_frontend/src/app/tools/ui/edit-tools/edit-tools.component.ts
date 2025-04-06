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
import { ToolService } from '../../services/tool.service';
import { Image } from 'primeng/image';

interface State {
  name: string;
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
    Image,
  ],
  templateUrl: './edit-tools.component.html',
  styleUrl: './edit-tools.component.css',
})

export class EditToolsComponent implements OnInit {

  @Input() visible: boolean = false;
  @Input() tool: any = {};
  @Input() state: string = '';
  @Output() closeDialog = new EventEmitter<void>();

  states: State[] | undefined;
  selectedState: State | undefined;
  selectedFile!: File;
  previewImage: string | ArrayBuffer | null = null;
  errorMessage: string = '';
  

  constructor(
    private messageService: MessageService,
    private toolService: ToolService
  ) {}

  showSuccess() {
    if (this.selectedState?.name === 'ACTIVO') {
      this.tool.state = 1;
    } else if (this.selectedState?.name === 'INACTIVO') {
      this.tool.state = 2;
    } else if (this.selectedState?.name === 'EN USO') {
      this.tool.state = 3;
    }
    
    this.toolService
      .updateTool(
        this.tool.id,
        this.tool.name,
        this.tool.marca,
        this.selectedFile,
        this.tool.state
      )
      .subscribe({
        next: (response: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'La herramienta ha sido actualizada con éxito',
          });
          setTimeout(() => {
            this.closeDialog.emit();
            window.location.reload();
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = 'Error al crear la herramienta.';
          console.error(err);
        },
      });
  }

  onFileSelected(event: any) {
    if (event.files.length > 0) {
      this.selectedFile = event.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  ngOnInit(): void {
    this.states = [
      { name: 'ACTIVO' },
      { name: 'INACTIVO' },
      { name: 'EN USO' },
    ];
  }

  close() {
    this.visible = false;
    this.closeDialog.emit();
  }
}
