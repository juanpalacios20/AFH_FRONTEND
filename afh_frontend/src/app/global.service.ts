import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class GlobalService {
  public indexTittle: string = 'AFH: Metalmecanicos';

  constructor(private titleService: Title){}

  changeTitle(title: string) {
    this.indexTittle = title;
    this.titleService.setTitle(this.indexTittle);
  }
}
