import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToolService } from '../../../tools/services/tool.service';

interface Tool {
  id: number;
  code: string;
  marca: string;
  image?: string;
  state?: number;
}

@Component({
  selector: 'app-create-ticket',
  imports: [
    Dialog,
    ButtonModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    CommonModule,
    ToastModule,
    MultiSelectModule
  ],
  templateUrl: './create-ticket.component.html',
  styleUrl: './create-ticket.component.css',
})
export class CreateTicketComponent {
  lessee: string = '';
  place: string = '';
  tools: Tool[] = [];
  selectedTools: Tool[] = [];


  @Input() visible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();

  close() {
    this.visible = false;
    this.closeDialog.emit();
    this.resetForm();
  }

  resetForm(){
    this.lessee = '';
    this.place = '';
  }

  constructor(private toolService: ToolService) {}

  ngOnInit(): void {
    this.toolService.getTools().subscribe({
      next: (data) => {
        this.tools = data;
      },
      error: (error) => {
        console.error('Error al obtener herramientas', error);
      },
    });
  }
}
