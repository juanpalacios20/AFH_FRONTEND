import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { workProgressOrder } from '../../../interfaces/models';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-progress-info',
  imports: [
    NgIf,
    ButtonModule,
    AutoCompleteModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './progress-info.component.html',
  styleUrl: './progress-info.component.css',
})
export class ProgressInfoComponent {
  workProgressOrder: workProgressOrder | null = null;
  filteredStates: string[] = [];
  selectedStates: string = '';
  statesOption = ['En progreso', 'Completado'];

  filterStates(event: any) {
    const query = event.query.toLowerCase();
    this.filteredStates = this.statesOption.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
}
