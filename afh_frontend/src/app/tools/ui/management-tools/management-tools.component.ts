import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { EditToolsComponent } from '../edit-tools/edit-tools.component';
import { CreateToolsComponent } from '../create-tools/create-tools.component';
import { ToolService } from '../../services/tool.service';

@Component({
  selector: 'app-management-tools',
  standalone: true,
  imports: [
    ButtonModule,
    RippleModule,
    MenuComponent,
    TableModule,
    TagModule,
    RatingModule,
    CommonModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ConfirmDialog,
    ToastModule,
    EditToolsComponent,
    CreateToolsComponent,
  ],
  templateUrl: './management-tools.component.html',
  styleUrl: './management-tools.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ManagementToolsComponent implements OnInit {
  value3: string = '';
  tools: any[] = [];
  tool: any = {};
  state: string = '';
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private toolService: ToolService
  ) {}
  ngOnInit(): void {
    this.loadTools();
  }

  loadTools() {
    this.toolService.getTools().subscribe(
      (response: any) => {
        this.tools = response;
      },
      (error: any) => {
        console.error('Error al cargar las herramientas:', error);
      }
    );
  }

  getSeverity(
    state: number
  ):
    | 'success'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'info'
    | 'contrast'
    | undefined {
    switch (state) {
      case 1:
        return 'success';
      case 2:
        return 'danger';
      case 3:
        return 'secondary';
      default:
        return 'secondary'; // Map "unknown" to a valid type
    }
  }

  getStateString(state: number): string {
    switch (state) {
      case 1:
        return 'ACTIVO';
      case 2:
        return 'INACTIVO';
      case 3:
        return 'EN USO';
      default:
        return 'Estado desconocido';
    }

  }

  editDialogVisible = false;
  createDialogVisible = false;

  getTool(toolId: number) {
    this.toolService.getTool(toolId).subscribe((response: any) => {
      this.tool = response;
      console.log('Herramienta obt:', this.tool);
      this.state = this.getStateString(this.tool.state);
      console.log('Estado de la herramienta2:', this.state, this.tool.state, this.tool.name, this.tool.code);
    });
    
  }

  showEditDialog(toolId: number) {
    this.getTool(toolId);
    
    setTimeout(() => {
      console.log('Estado que se enviará al modal:', this.state);
      this.editDialogVisible = true;
    }, 200); // Esperamos a que `state` se actualice
  }
  

  showCreateDialog() {
    this.createDialogVisible = true;
  }

  deleteTask(id: number) {
    this.toolService.deleteTool(id).subscribe(
      (response) => {
        console.log('Herramienta eliminada:', response);
        this.loadTools();
      },
      (error) => {
        console.error('Error al eliminar la herramienta:', error);
      }
    );
  }

  confirm2(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro que desea eliminar esta herramienta?',
      header: '!Advertencia!',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',

      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
      },

      accept: () => {
        this.deleteTask(id);
        console.log('Herramienta eliminada:', id);
        this.messageService.add({
          severity: 'info',
          summary: 'Acción confirmada',
          detail: 'Herramienta eliminada con exito',
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Acción cancelada',
          detail: 'La herramienta no ha sido eliminada',
        });
      },
    });
  }
}
