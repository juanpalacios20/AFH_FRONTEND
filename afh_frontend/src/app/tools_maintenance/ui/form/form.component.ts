import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { Tool, ToolsMaintenance } from '../../../interfaces/models';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LocalStorageService } from '../../../localstorage.service';
import { ToolsMaintenanceService } from '../../services/maintenance.service';
import { ToolService } from '../../../tools/services/tool.service';
import { SelectModule } from 'primeng/select';
import { CookieService } from 'ngx-cookie-service';

interface typeMaintenance {
  name: string;
  key: string;
}

@Component({
  selector: 'app-form',
  imports: [
    Dialog,
    ButtonModule,
    FormsModule,
    InputTextModule,
    CommonModule,
    CheckboxModule,
    ToastModule,
    DatePickerModule,
    FluidModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export default class FormComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() action: number = 0;
  @Input() toolMaintenance: ToolsMaintenance | undefined;
  @Input() tool: Tool | undefined;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onToolCreated = new EventEmitter<void>();
  @Output() onEditCreated = new EventEmitter<void>();
  actionTittle: string = '';
  loadingTool: boolean = false;
  errorMessage: string = '';
  selectedType: typeMaintenance[] = [];
  start_date: Date | undefined;
  duration: number | null = null;
  responsible: string = '';
  email: string = '';
  next_date: Date | undefined;
  observations: string = '';
  tools: Tool[] | undefined;
  tools_Available: Tool[] | undefined;
  selectedTool: Tool | undefined;

  types: typeMaintenance[] = [
    { name: 'Correctivo', key: '1' },
    { name: 'Preventivo', key: '2' },
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    private maintenanceService: ToolsMaintenanceService,
    private toolService: ToolService,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.email = this.cookieService.get('email');
    console.log(this.selectedType);
    this.loadTools();
  }

  onSubmit() {
    if (this.action === 0) {
      this.createToolMaintenance();
    }
    if (this.action === 1) {
      this.editToolMaintenance();
    }
  }

  createToolMaintenance() {
    this.loadingTool = true;
    let maintenanceLS: any[] | null =
      this.localStorageService.getItem('maintenances');
    let data = {
      maintenance_technician_name: this.responsible,
      tool_id: this.selectedTool?.id || 0,
      date: this.start_date?.toISOString().split('T')[0],
      maintenance_days: this.duration || 0,
      observations: this.observations,
      next_maintenance_date: this.next_date?.toISOString().split('T')[0],
      type: this.selectedType[0].key,
      user_email: this.email,
    };
    console.log('data', data);
    this.maintenanceService.createToolMaintenance(data).subscribe({
      next: (response) => {
        this.localStorageService.removeItem('maintenances');
        this.localStorageService.removeItem('tools');
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Mantenimiento de herramienta creado exitosamente',
        });
        this.loadingTool = false;
        this.visible = false;
        this.onToolCreated.emit();
        this.close();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear el mantenimiento de herramienta',
        });
      },
    });
  }

  editToolMaintenance() {
    this.loadingTool = true;
    let data: any = {};
    if (this.selectedTool && this.toolMaintenance) {
      if (this.selectedTool.id !== this.toolMaintenance.tool.id) {
        data.tool_id = this.selectedTool.id;
      }
      if (
        this.start_date?.toISOString().split('T')[0] !==
        this.toolMaintenance?.date
      ) {
        data.date = this.start_date?.toISOString().split('T')[0];
      }
      if (this.duration !== this.toolMaintenance.maintenance_days) {
        data.maintenance_days = this.duration;
      }
      if (this.observations !== this.toolMaintenance.observations) {
        data.observations = this.observations;
      }
      if (
        this.next_date?.toISOString().split('T')[0] !==
        this.toolMaintenance.next_maintenance_date
      ) {
        data.next_maintenance_date = this.next_date
          ?.toISOString()
          .split('T')[0];
      }
      if (
        this.responsible !== this.toolMaintenance.maintenance_technician_name
      ) {
        data.maintenance_technician_name = this.responsible;
      }
      if (this.selectedType[0].key !== this.toolMaintenance.type.toString()) {
        data.type = this.selectedType[0].key;
      }
      this.maintenanceService
        .editMaintenance(data, this.toolMaintenance.id)
        .subscribe({
          next: (response) => {
            this.localStorageService.removeItem('maintenances');
        this.localStorageService.removeItem('tools');
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Mantenimiento de herramienta editado exitosamente',
            });
            this.loadingTool = false;
            this.onEditCreated.emit();
            this.close();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo editar el mantenimiento de herramienta',
            });
          },
        });
    }
  }

  loadTools() {
    const toolsLS: any[] | null =
      this.localStorageService.getItem('toolsAvailable');
    if (toolsLS && toolsLS.length > 0) {
      this.tools_Available = toolsLS;
      this.tools = this.tools_Available.filter(
        (tool: Tool) => tool.state === 1
      );
    } else {
      this.toolService.getTools().subscribe({
        next: (data) => {
          this.tools = data.filter((tool: Tool) => tool.state === 1);
          this.localStorageService.setItem('toolsAvailable', this.tools);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las herramientas',
          });
        },
      });
    }
  }

  ngTypesChanges() {
    if (this.selectedType.length > 1) {
      this.selectedType.splice(0, 1);
      console.log('info', this.selectedType);
    }
  }

  resetForm() {
    this.selectedTool = undefined;
    this.responsible = '';
    this.next_date = undefined;
    this.start_date = undefined;
    this.duration = null;
    this.observations = '';
    this.selectedType = [];
  }

  close() {
    this.resetForm();
    this.closeDialog.emit();
  }

  loadEditData() {
    console.log(
      'fecha',
      this.toolMaintenance?.next_maintenance_date,
      this.toolMaintenance?.next_maintenance_date
        ? new Date(this.toolMaintenance.next_maintenance_date)
        : undefined
    );
    if (this.toolMaintenance) {
      this.selectedTool = this.toolMaintenance.tool;
      this.responsible = this.toolMaintenance.maintenance_technician_name;
      this.next_date = this.toolMaintenance.next_maintenance_date
        ? new Date(this.toolMaintenance.next_maintenance_date + 'T00:00:00')
        : undefined;

      this.start_date = this.toolMaintenance.date
        ? new Date(this.toolMaintenance.date + 'T00:00:00')
        : undefined;
      this.duration = this.toolMaintenance.maintenance_days;
      this.observations = this.toolMaintenance.observations;
      this.selectedType = [
        {
          name:
            this.toolMaintenance?.type === 1
              ? 'Correctivo'
              : this.toolMaintenance?.type === 2
              ? 'Preventivo'
              : '',
          key: this.toolMaintenance?.type
            ? String(this.toolMaintenance.type)
            : '1',
        },
      ];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible === true) {
      console.log('action', this.action);
      if (this.action === 0) {
        this.actionTittle = 'Ingresar nuevo mantenimiento';
        this.selectedTool = this.tool;
      } else if (this.action === 1) {
        this.actionTittle = 'Editar matenimiento';
        this.loadEditData();
      }
    }
  }
}
