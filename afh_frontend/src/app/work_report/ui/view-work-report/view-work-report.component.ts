import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { WorkReport } from '../../../interfaces/models';
import { ButtonModule } from 'primeng/button';
import { WorkReportService } from '../../services/work_report.service';

@Component({
  selector: 'app-view-work-report',
  imports: [NgIf, NgFor, Dialog, ButtonModule],
  templateUrl: './view-work-report.component.html',
  styleUrl: './view-work-report.component.css',
})
export class ViewWorkReportComponent {
  @Input() visible: boolean = false;
  @Input() report?: WorkReport;
  @Output() closeDialog = new EventEmitter<void>();
  loadingDownload: boolean = false;

  constructor(private workReportService: WorkReportService) {}

  close() {
    this.visible = false;
    this.closeDialog.emit();
  }

  generarPDF(): void {
    this.loadingDownload = true;

    this.workReportService.workReportPdf(this.report?.id || 0).subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `acta de trabajo ${this.report?.work_order.quote.code}.pdf`;

        if (contentDisposition) {
          const matches = /filename="(.+)"/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        const blob = new Blob([response.body!], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.loadingDownload = false;
      },
      error: (error) => {
        this.loadingDownload = false;
        console.log(error);
      },
    });
  }
}
