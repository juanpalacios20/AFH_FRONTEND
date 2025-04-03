import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ToolService } from '../../services/tool.service';
import { Image } from 'primeng/image';

@Component({
  selector: 'app-view-tool',
  imports: [Dialog, ButtonModule,Image],
  templateUrl: './view-tool.component.html',
  styleUrl: './view-tool.component.css'
})
export class ViewToolComponent {
  constructor(
    private toolService: ToolService
  ) {}

  @Input() visible: boolean = false;
  @Input() tool: any = {};
  @Input() state: string = '';
  @Output() closeDialog = new EventEmitter<void>();

  showDialog() {
      this.visible = true;
  }

  close() {
    this.visible = false;
    this.closeDialog.emit();
  }

  
}
