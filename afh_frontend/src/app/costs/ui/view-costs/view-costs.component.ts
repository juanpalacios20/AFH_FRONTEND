import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Costs } from '../../../interfaces/models';
import { Button } from "primeng/button";
import { CostService } from '../../services/costs.service';

@Component({
  selector: 'app-view-costs',
  imports: [Dialog, NgFor, CommonModule, Button],
  templateUrl: './view-costs.component.html',
  styleUrl: './view-costs.component.css',
})
export default class ViewCostsComponent {
  @Input() visible: boolean = true;
  @Input() cost: Costs | undefined;
  @Output() closeDialog = new EventEmitter<void>();

  constructor(private costService: CostService) {}

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

  downloadPDF() {
    this.costService.downloadPDF(this.cost?.id || 0).subscribe({
      next: (pdf: Blob) => {
        const fileURL = URL.createObjectURL(pdf);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'costos.pdf';
        a.click();
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }
}
