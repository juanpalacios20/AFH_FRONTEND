import { Component } from '@angular/core';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { exhibit } from '../../../interfaces/models';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-form-advance',
  imports: [ButtonModule, RouterModule, InputTextModule, FormsModule, NgFor],
  templateUrl: './form-advance.component.html',
  styleUrl: './form-advance.component.css',
})
export class FormAdvanceComponent {
  orderCode: string = '';
  advanceDescription: string = '';
  exhibits: exhibit[] = [
    {
      id: 0,
      tittle: '',
      images: [],
    },
  ];

  addExhibit() {
    this.exhibits.push({
      id: 0,
      tittle: '',
      images: [],
    });
  }

  deleteExhibit(index: number) {
    this.exhibits.splice(index, 1);
  }

  addImage(index: number) {
    this.exhibits[index].images.push('');
  }

  deleteImage(anexoIndex: number, imagenIndex: number) {
    this.exhibits[anexoIndex].images.splice(imagenIndex, 1);
  }
}
