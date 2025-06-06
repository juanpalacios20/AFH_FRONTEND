import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { QuoteService } from '../../services/quote.service';

@Component({
  selector: 'app-create-quote',
  imports: [
    Dialog,
    ButtonModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    CommonModule,
    ToastModule,
    MultiSelectModule,
    TextareaModule,
    NgIf,
  ],
  templateUrl: './create-quote.component.html',
  styleUrl: './create-quote.component.css',
  providers: [MessageService],
})
export default class CreateQuoteComponent implements OnChanges {
  actionTittle: string = 'Crear';
  itemsPorOpcion: {
    descripcion: string;
    precio: number;
    unidad: string;
    cantidad: number;
    valorUnitario: number;
  }[][] = [];
  tasks: { descripcion: string }[] = [{ descripcion: '' }];
  totalPrice: number = 0;
  optionsSelected: number = 0;
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onQuoteCreated = new EventEmitter<void>();

  constructor(
    private quoteService: QuoteService,
    private toast: MessageService
  ) {}

  submitQuote() {
    const optionsToSend: number[] = [];

    const createAllItems = async () => {
      const optionItemIds: number[][] = [];

      for (const optionItems of this.itemsPorOpcion) {
        const itemIds: number[] = [];

        for (const item of optionItems) {
          const itemData = {
            description: item.descripcion,
            units: item.unidad,
            amount: item.cantidad,
            unit_value: item.valorUnitario,
          };

          try {
            const response: any = await this.quoteService
              .createItem(itemData)
              .toPromise();
            itemIds.push(response.item_id);
          } catch (error) {
            console.error('Error al crear item', error);
          }
        }

        optionItemIds.push(itemIds);
      }

      return optionItemIds;
    };

    const createAllOptions = async (optionItemIds: number[][]) => {
      for (const itemIds of optionItemIds) {
        const optionData = {
          description: 'Opción generada automáticamente',
          items: itemIds,
        };

        try {
          const response: any = await this.quoteService
            .createOption(optionData)
            .toPromise();
          optionsToSend.push(response.option_id);
        } catch (error) {
          console.error('Error al crear opción', error);
        }
      }
    };

    const createFinalQuote = async () => {
      const quoteData = {
        description: this.itemsPorOpcion
          .map((items) => items.map((item) => item.descripcion).join(', ')),
        customer_id: 1,
        options: optionsToSend,
        tasks: this.tasks.map((t) => t.descripcion),
      };

      try {
        await this.quoteService.createQuote(quoteData).toPromise();
        this.toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cotización creada correctamente',
        });
        this.onQuoteCreated.emit();
        this.close();
      } catch (error) {
        console.error('Error al crear cotización', error);
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear la cotización',
        });
      }
    };

    // Encadenar todo
    createAllItems()
      .then((optionItemIds) => createAllOptions(optionItemIds))
      .then(() => createFinalQuote());
  }

  updateTotalPrice() {
    this.totalPrice = this.itemsPorOpcion.reduce(
      (sum, items) =>
        sum + items.reduce((s, item) => s + (item.precio || 0), 0),
      0
    );
  }

  updatePrice() {
    this.itemsPorOpcion.forEach((items) => {
      items.forEach((item) => {
        item.precio = item.valorUnitario * (item.cantidad || 1);
      });
    });
    this.updateTotalPrice();
  }

  updateOptionsSelected() {
    this.itemsPorOpcion = [];

    for (let i = 0; i < this.optionsSelected; i++) {
      this.itemsPorOpcion.push([
        {
          descripcion: '',
          precio: 0,
          unidad: '',
          cantidad: 0,
          valorUnitario: 0,
        },
      ]);
    }
  }

  addItem(index: number) {
    this.itemsPorOpcion[index].push({
      descripcion: '',
      precio: 0,
      unidad: '',
      cantidad: 0,
      valorUnitario: 0,
    });
  }

  removeItem(opcionIndex: number, itemIndex: number) {
    this.itemsPorOpcion[opcionIndex].splice(itemIndex, 1);
  }

  getTotalPrice(opcionIndex: number): number {
    return this.itemsPorOpcion[opcionIndex].reduce(
      (sum, item) => sum + (item.precio || 0),
      0
    );
  }

  addTask() {
    this.tasks.push({ descripcion: '' });
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
  }

  close() {
    this.visible = false;
    this.itemsPorOpcion = [];
    this.tasks = [{ descripcion: '' }];
    this.totalPrice = 0;
    this.optionsSelected = 0;
    this.closeDialog.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      if (this.action === 0) {
        this.actionTittle = 'Crear cotización';
      } else if (this.action === 1) {
        this.actionTittle = 'Editar cotización';
      }
    }
  }
}
