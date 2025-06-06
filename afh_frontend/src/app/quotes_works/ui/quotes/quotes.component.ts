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
import ViewQuotesComponent from '../view-quotes/view-quotes.component';
import { QuoteService } from '../../services/quote.service';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Quote {
  code: string;
  customer: Client;
  description: string;
  issue_date: number;
  date: string;
  state: number;
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
    TagModule,
    ViewQuotesComponent
  ],
  templateUrl: './quotes.component.html',
  styleUrl: './quotes.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class QuotesComponent {
  value3: string = '';
  quoteCreateDialogVisible: boolean = false;
  quoteEditDialogVisible: boolean = false;
  viewQuoteDialogVisible: boolean = false;
  quoteAction: number = 0; // 0: Create, 1: Edit
  // quotes: Quote[] = [{code: '01-2025', name: 'Samuel', description: 'Description 1', status: 3, date: '03/06/25', observations: 'Observation 1'},];
  quotes: Quote[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private quoteService: QuoteService
  ) {}
  
  loadQuotes(){
    this.quoteService.getQuotes().subscribe({
      next: (response) => {
        this.quotes = response;
        console.log('Quotes loaded successfully:', this.quotes);
      },
      error: (error) => {
        console.error('Error loading quotes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las cotizaciones.',
        });
      },
    });
  }

  ngOnInit() {
    this.loadQuotes();
  }

  showCreateQuoteDialog() {
    this.quoteCreateDialogVisible = true;
    this.quoteAction = 0;
  }

  closeCreateQuoteDialog() {
    this.quoteCreateDialogVisible = false;
  }

  handleQuoteCreated() {
    this.closeCreateQuoteDialog();
    this.loadQuotes();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Cotización creada exitosamente.',
    });
  }

  showEditQuoteDialog() {
    this.quoteEditDialogVisible = true;
    this.quoteAction = 1;
  }

  closeEditQuoteDialog() {
    this.quoteEditDialogVisible = false;
  }

  handleQuoteEdited() {
    this.closeEditQuoteDialog();
  }

  showViewComponent() {
    this.viewQuoteDialogVisible = true;
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

  deleteQuote(id: number) {
    this.quoteService.deleteQuote(id).subscribe({
      next: (response: any) => {
        this.loadQuotes();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cotización eliminada correctamente',
        });
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar la cotización, intentelo nuevamente',
        });
      },
    });
  }

  confirmationDelete(id: number) {
    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.',
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
        this.deleteQuote(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Exito',
          detail: 'Cliente eliminado con éxito',
        });
      },
    });
  }

}
