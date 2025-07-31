import { Injectable } from '@angular/core';
import { BaseHttpService } from './shared/data_access/base_http.service';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService extends BaseHttpService {
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
