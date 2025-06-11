import { CommonModule, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { QuoteService } from '../../services/quote.service';

interface Item {
  id: number;
  description: string;
  units: string;
  total_value: number;
  amount: number;
  unit_value: number;
}

interface Option {
  id: number;
  name: string;
  total_value: number;
  items: Item[];
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Quote {
  id: number;
  customer: Customer;
  code: string;
  description: string;
  issue_date: number;
  options: Option[];
  state: number;
  tasks: string[];
}

@Component({
  selector: 'app-view-quotes',
  imports: [Dialog, ButtonModule, TagModule, NgFor, CommonModule, ButtonModule],
  templateUrl: './view-quotes.component.html',
  styleUrl: './view-quotes.component.css',
})
export default class ViewQuotesComponent {
  loadingDownload = false;
  @Input() quote: Quote | null = null;
  @Input() state: string = '';
  @Input() severity:
    | 'success'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'info'
    | 'contrast'
    | undefined = 'info';
  @Input() visible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();

  constructor(private quoteService: QuoteService) {}

  showDialog() {
    this.visible = true;
  }

  close() {
    this.visible = false;
    this.closeDialog.emit();
  }
  
  pdf(): void {
    this.loadingDownload = true;

    this.quoteService.getPDF(this.quote?.id || 0).subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `cotización ${this.quote?.code}.pdf`;

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

  changeState() {
    const data = {
      state: 2,
    };
    this.quoteService.changeState(this.quote?.id || 0, data);
    this.state = "APROBADO";
    this.severity = "success";
  }
}
