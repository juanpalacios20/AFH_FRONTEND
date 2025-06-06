import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-view-quotes',
  imports: [Dialog, ButtonModule, TagModule],
  templateUrl: './view-quotes.component.html',
  styleUrl: './view-quotes.component.css'
})
export default class ViewQuotesComponent {
  // @Input() code: string = '';
  // @Input() name: string = '';
  // @Input() description: string = '';
  @Input() status: string = 'RECHAZADO';
  // @Input() date: string = '';
  @Input() visible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();

  showDialog() {
    this.visible = true;
  }
  close() {
    this.visible = false;
    this.closeDialog.emit();
  }
}
