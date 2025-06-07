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
  quoteToFind: string = '';
  quoteCreateDialogVisible: boolean = false;
  quoteEditDialogVisible: boolean = false;
  viewQuoteDialogVisible: boolean = false;
  quoteAction: number = 0; // 0: Create, 1: Edit
  viewQuote: Quote | null = null;
  quotes: Quote[] = [];
  quoteToEdit: Quote | null = null;
  state: string = '';
  severity: 'success' | 'warn' | 'danger' | 'secondary' | 'info' | 'contrast' | undefined = 'info';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private quoteService: QuoteService
  ) {}
  
  loadQuotes(){
    this.quoteService.getQuotes().subscribe({
      next: (response) => {
        this.quotes = response;
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

  showEditQuoteDialog(quote: Quote) {
    this.quoteEditDialogVisible = true;
    this.quoteAction = 1;
    this.quoteToEdit = quote;
  }

  closeEditQuoteDialog() {
    this.quoteEditDialogVisible = false;
    
  }

  handleQuoteEdited() {
    this.closeEditQuoteDialog();
    this.loadQuotes();
    this.quoteAction = 0;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Cotización editada exitosamente.',
    });
  }

  showViewComponent(quote: Quote) {
    this.viewQuote = quote;
    this.state = this.getStateString(quote.state);
    this.severity = this.getSeverity(quote.state);
    this.viewQuoteDialogVisible = true;
    console.log('Quote to view:', quote, this.viewQuote);
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
