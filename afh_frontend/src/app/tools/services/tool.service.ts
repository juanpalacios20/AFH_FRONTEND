import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { Observable, tap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ToolService extends BaseHttpService {

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  addTool(name: string, marca: string, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image);
    formData.append('marca', marca);

    return this.http.post(`${this.apiUrl}tool/addtool/`, formData).pipe(
      tap((response: any) => {
        console.log('Herramienta creada:', response);
      })
    );
  }

  getTool(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}tool/gettool/${id}`).pipe(
      tap((response: any) => {
        console.log('Herramienta obtenida:', response);
      }
    ));
    }

  getTools(): Observable<any> {
    return this.http.get(`${this.apiUrl}tool/gettools`, { headers: this.headers }).pipe(
      tap((response: any) => {
        console.log('Herramientas obtenidas:', response);
      })
    );
  }

  ngOnInit() {
    this.getTools();
  }

  updateTool(id: number, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}tool/updatetool/`, formData).pipe(
      tap((response: any) => {
        console.log('Herramienta actualizada:', response);
      })
    );
  }
  
  


  deleteTool(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}tool/delete/${id}`).pipe(
      tap((response: any) => {
        console.log('Herramienta eliminada:', response);
      })
    );
  }

}
