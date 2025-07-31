import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { GlobalService } from './global.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }],
})
export class AppComponent implements OnInit {
  constructor(
    private globalService: GlobalService,
    private titleService: Title
  ) {}
  ngOnInit(): void {
    this.titleService.setTitle(this.globalService.indexTittle);
  }
}
