import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import CreateQuoteComponent from '../create-quote/create-quote.component';
import { TagModule } from 'primeng/tag';

interface Quote {
  code: string;
  name: string;
  description: string;
  status: number;
  date: string;
  observations: string;
}
@Component({
  selector: 'app-quotes',
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
    CreateQuoteComponent,
    TagModule
  ],
  templateUrl: './quotes.component.html',
  styleUrl: './quotes.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class QuotesComponent {
  value3: string = '';
  quoteCreateDialogVisible: boolean = false;
  quoteAction: number = 0; // 0: Create, 1: Edit
  quotes: Quote[] = [{code: '01-2025', name: 'Samuel', description: 'Description 1', status: 3, date: '03/06/25', observations: 'Observation 1'},];

  showCreateQuoteDialog() {
    this.quoteCreateDialogVisible = true;
  }

  closeCreateQuoteDialog() {
    this.quoteCreateDialogVisible = false;
  }

  handleQuoteCreated() {
    this.closeCreateQuoteDialog();
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
        return 'secondary';
      case 2:
        return 'success';
      case 3:
        return 'danger';
      default:
        return 'secondary'; // Map "unknown" to a valid type
    }
  }

  getStateString(state: number): string {
    switch (state) {
      case 1:
        return 'PROCESO';
      case 2:
        return 'APROBADO';
      case 3:
        return 'RECHAZADO';
      default:
        return 'Estado desconocido';
    }
  }
}
