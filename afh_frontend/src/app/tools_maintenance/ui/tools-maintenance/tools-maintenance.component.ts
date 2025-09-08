import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GlobalService } from '../../../global.service';
import { LocalStorageService } from '../../../localstorage.service';
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
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolsMaintenance } from '../../../interfaces/models';
import FormComponent from '../form/form.component';
import { ToolsMaintenanceService } from '../../services/maintenance.service';
import ViewMaintenanceComponent from '../view-maintenance/view-maintenance.component';

@Component({
  selector: 'app-tools-maintenance',
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
    FormComponent,
    ViewMaintenanceComponent,
  ],
  templateUrl: './tools-maintenance.component.html',
  styleUrl: './tools-maintenance.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ToolsMaintenanceComponent implements OnInit {
  loadingTools: boolean = false;
  tools: ToolsMaintenance[] = [];
  createDialogVisible: boolean = false;
  editDialogVisible: boolean = false;
  viewDialog: boolean = false;
  toolToEdit: ToolsMaintenance | undefined;
  maintenanceToView: ToolsMaintenance | undefined;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private globalService: GlobalService,
    private localStorageService: LocalStorageService,
    private maintenanceService: ToolsMaintenanceService
  ) {
    this.globalService.changeTitle('AFH: Herramientas en mantenimiento');
  }

  handleToolCreated() {
    this.getMainenanceTools();
  }

  handleToolEdited() {
    this.localStorageService.removeItem('maintenances');
    this.getMainenanceTools();
  }

  showEditDialog(tool: ToolsMaintenance) {
    this.editDialogVisible = true;
    this.toolToEdit = tool;
  }

  showCreateDialog() {
    this.createDialogVisible = true;
  }

  showViewDialog(maintenance: ToolsMaintenance) {
    this.maintenanceToView = maintenance;
    this.viewDialog = true;
  }

  ngOnInit(): void {
    this.getMainenanceTools();
  }

  getMainenanceTools() {
    this.loadingTools = true;
    const maintenanceLS: any[] | null =
      this.localStorageService.getItem('maintenances');
    if (maintenanceLS !== null) {
      this.tools = maintenanceLS;
      console.log('maintenance', this.tools);
      return;
    }
    this.maintenanceService.getToolsMainenance().subscribe({
      next: (response) => {
        this.tools = response;
        console.log('respuesta', response);
        this.localStorageService.setItem('maintenances', this.tools);
        this.loadingTools = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las herramientas en mantenimiento',
        });
        this.loadingTools = false;
      },
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
        return 'danger';
      case 2:
        return 'warn';
      default:
        return 'secondary'; // Map "unknown" to a valid type
    }
  }

  getStateString(state: number): string {
    switch (state) {
      case 1:
        return 'CORRECTIVO';
      case 2:
        return 'PREVENTIVO';
      default:
        return 'Estado desconocido';
    }
  }
}
