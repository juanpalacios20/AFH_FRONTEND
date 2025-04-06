import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
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
import { ViewToolComponent } from '../view-tool/view-tool.component';

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
    ViewToolComponent,
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
  editDialogVisible = false;
  createDialogVisible = false;
  viewDialogVisible = false;
  timestamp = Date.now();


  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private toolService: ToolService
  ) {}

  ngOnInit(): void {
    this.loadTools();
  }

  loadTools() {
    this.toolService.getTools().subscribe((tools: any[]) => {
      this.tools = tools;
    });
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

  getTool(toolId: number) {
    this.toolService.getTool(toolId).subscribe((response: any) => {
      this.tool = response;
      this.state = this.getStateString(this.tool.state);
    });
  }

  showEditDialog(toolId: number) {
    this.getTool(toolId);
    this.editDialogVisible = true;
  }

  showCreateDialog() {
    this.createDialogVisible = true;
  }

  showViewDialog(toolId: number) {
    this.getTool(toolId);

    setTimeout(() => {
      this.viewDialogVisible = true;
    }, 200);
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

  confirm2(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar esta herramienta?',
      header: '¡Advertencia!',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
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
        this.messageService.add({
          severity: 'info',
          summary: 'Acción confirmada',
          detail: 'Herramienta eliminada con éxito',
        });
      },
    });
  }
  
}
