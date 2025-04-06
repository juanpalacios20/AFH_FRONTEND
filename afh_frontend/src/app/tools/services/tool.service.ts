import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToolService extends BaseHttpService {
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
    return this.http.get(`${this.apiUrl}tool/gettools`).pipe(
      tap((response: any) => {
        console.log('Herramientas obtenidas:', response);
      })
    );
  }

  ngOnInit() {
    this.getTools();
  }

  updateTool(id: number, name: string, marca: string, image: File, state: number): Observable<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('name', name);
    formData.append('marca', marca);
    formData.append('state', state.toString());
    if (image) {
      formData.append('image', image);
    }
  
    return this.http.patch(`${this.apiUrl}tool/updatetool/`, formData).pipe(
      tap((response: any) => {
        console.log('Herramienta actualizada:', response);
        console.log('imagen', image);
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
