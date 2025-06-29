import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import FormWorkComponent from '../form-work/form-work.component';
import { WorkReportService } from '../../services/work_report.service';
import { WorkReport } from '../../../interfaces/models';
import { ViewWorkReportComponent } from '../view-work-report/view-work-report.component';

@Component({
  selector: 'app-work-report',
  imports: [
    ButtonModule,
    MenuComponent,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ConfirmDialog,
    ToastModule,
    TableModule,
    TagModule,
    FormWorkComponent,
    ViewWorkReportComponent,
  ],
  templateUrl: './work-report.component.html',
  styleUrl: './work-report.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class WorkReportComponent implements OnInit {
  action: number = 0;
  viewVisible = false;
  selectedReport!: WorkReport;
  workReports: WorkReport[] = [];
  workReportDialogVisible: boolean = false;
  workEditVisible: boolean = false;
  workReportToSearch: string = '';
  workReportToEdit: WorkReport | null = null;

  constructor(
    private workReportService: WorkReportService,
    private messageService: MessageService
  ) {}

  openView(report: WorkReport) {
    console.log(report);
    this.selectedReport = report;
    this.viewVisible = true;
  }

  showEditDialog(workReport: WorkReport) {
    this.workReportToEdit = workReport;
    this.action = 1;
    this.workEditVisible = true;
  }

  closeEditDialog() {
    this.loadWorkReports();
    this.action = 0;
    this.workEditVisible = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Acta de trabajo editada exitosamente.',
    });
  }

  handleWorkEdited() {
    this.closeEditDialog();
  }

  showCreateWorkReportDialog() {
    this.action = 0;
    this.workReportDialogVisible = true;
  }

  closeWorkReportDialog() {
    this.action = 0;
    this.workReportDialogVisible = false;
    this.loadWorkReports();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Acta de trabajo creada exitosamente.',
    });
  }

  handleWorkReportCreated() {
    this.closeWorkReportDialog();
  }

  ngOnInit() {
    this.loadWorkReports();
  }

  loadWorkReports() {
    this.workReportService.getWorkReports().subscribe({
      next: (response) => {
        this.workReports = response;
        console.log('Work reports loaded:', this.workReports);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load work reports',
        });
      },
    });
  }
}
