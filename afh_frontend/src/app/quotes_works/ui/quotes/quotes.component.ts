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
import { Quote } from '../../../interfaces/models';
import { NgIf } from '@angular/common';
import { LocalStorageService } from '../../../localstorage.service';
import { GlobalService } from '../../../global.service';
import { Title } from '@angular/platform-browser';

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
    ViewQuotesComponent,
    NgIf,
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
  loadingQuotes: boolean = false;
  quoteToEdit: Quote | null = null;
  state: string = '';
  severity:
    | 'success'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'info'
    | 'contrast'
    | undefined = 'info';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private quoteService: QuoteService,
    private localStorageService: LocalStorageService,
    private globalService: GlobalService,
    private titleService: Title
  ) {
    this.globalService.changeTitle('AFH: Cotizaciones');
  }

  loadQuotes() {
    this.loadingQuotes = true;
    const quotesLS: Quote[] | null = this.localStorageService.getItem('quotes');
    if (quotesLS && quotesLS.length > 0) {
      this.quotes = quotesLS;
    }
    this.quoteService.getQuotes().subscribe({
      next: (response) => {
        this.quotes = response;
        this.localStorageService.setItem('quotes', this.quotes);
        this.loadingQuotes = false;
      },
      error: (error) => {
        console.error('Error loading quotes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las cotizaciones.',
        });
        this.loadingQuotes = false;
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
    this.localStorageService.removeItem('quotes');
    this.quoteCreateDialogVisible = false;
    this.loadQuotes();
  }

  handleQuoteCreated() {
    this.closeCreateQuoteDialog();
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
    this.localStorageService.removeItem('quotes');
    this.quoteEditDialogVisible = false;
    this.loadQuotes();
  }

  handleQuoteEdited() {
    this.closeEditQuoteDialog();
    this.quoteAction = 0;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Cotización editada exitosamente.',
    });
  }

  closeViewComponet() {
    this.viewQuoteDialogVisible = false;
    this.loadQuotes();
  }

  showViewComponent(quote: Quote) {
    this.viewQuote = quote;
    this.state = this.getStateString(quote.state);
    this.severity = this.getSeverity(quote.state);
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
        '¿Está seguro que desea eliminar está cotización? Esta acción no se puede deshacer.',
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
      },
    });
  }
}
