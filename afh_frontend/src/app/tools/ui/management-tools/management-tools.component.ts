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
import { AuthService } from '../../../shared/auth/data_access/auth.service';
import { GlobalService } from '../../../global.service';
import { LocalStorageService } from '../../../localstorage.service';

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
  loadingTools = false;
  errorDelete: boolean = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private toolService: ToolService,
    private authService: AuthService,
    private globalService: GlobalService,
    private localStorageService: LocalStorageService
  ) {
    this.globalService.changeTitle('AFH: Herramientas');
  }

  ngOnInit(): void {
    this.loadTools();
    this.authService.isLoggedIn();
  }

  handleToolCreated() {
    this.loadTools();
    this.createDialogVisible = false;
  }

  handleToolEdited() {
    this.loadTools();
    this.editDialogVisible = false;
  }

  loadTools() {
    this.loadingTools = true;
    const toolsLS: any[] | null = this.localStorageService.getItem('tools');
    if (toolsLS && toolsLS.length > 0) {
      this.tools = toolsLS;
    } else {
      this.toolService.getTools().subscribe({
        next: (data) => {
          this.tools = data;
          this.loadingTools = false;
          this.localStorageService.setItem('tools', this.tools);
        },
        error: (error) => {
          this.loadingTools = false;
        },
      });
    }
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
        return 'warn';
      case 4:
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
      case 4:
        return 'EN RESERVA';
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

  deleteTool(id: number) {
    this.toolService.deleteTool(id).subscribe(
      (response) => {
        this.loadTools();
      },
      (error) => {
        this.error();
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
        this.deleteTool(id);
        this.messageService.add({
          severity: 'info',
          summary: 'Acción confirmada',
          detail: 'Herramienta eliminada con éxito',
        });
      },
    });
  }

  error() {
    this.messageService.add({
      severity: 'error',
      summary: 'Ha ocurrido un error',
      detail: 'Ha ocurrido un error, intente nuevamente',
    });
  }
}
