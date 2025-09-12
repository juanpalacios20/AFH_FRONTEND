import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Costs } from '../../../interfaces/models';

@Component({
  selector: 'app-view-costs',
  imports: [Dialog, NgFor, CommonModule],
  templateUrl: './view-costs.component.html',
  styleUrl: './view-costs.component.css',
})
export default class ViewCostsComponent {
  @Input() visible: boolean = true;
  @Input() cost: Costs | undefined;
  @Output() closeDialog = new EventEmitter<void>();

  close() {
    this.visible = false;
    this.closeDialog.emit();
  }

  balance(cost: string, quote: string): string {
    let cleanCost = cost.replace(/\$/g, '').replace(/\./g, '');
    let cleanQuote = quote.replace(/\$/g, '').replace(/\./g, '');

    let result = Number(cleanQuote) - Number(cleanCost);

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(result);
  }
}
