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
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

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
})
export default class CreateQuoteComponent implements OnChanges {
  actionTittle: string = 'Crear';
  itemsPorOpcion: { descripcion: string; precio: number }[][] = [];
  tasks: { descripcion: string }[] = [{ descripcion: '' }];
  totalPrice: number = 0;
  optionsSelected: number = 0;
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onQuoteCreated = new EventEmitter<void>();

  updateTotalPrice() {
    this.totalPrice = this.itemsPorOpcion.reduce(
      (sum, items) => sum + items.reduce((s, item) => s + (item.precio || 0), 0),
      0
    );
  }
  updateOptionsSelected() {
    this.itemsPorOpcion = [];

    for (let i = 0; i < this.optionsSelected; i++) {
      this.itemsPorOpcion.push([{ descripcion: '', precio: 0 }]);
    }
  }

  addItem(index: number) {
    this.itemsPorOpcion[index].push({ descripcion: '', precio: 0 });
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
