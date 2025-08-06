import { Injectable } from "@angular/core";
import Pusher from 'pusher-js';
import { environment } from "../../environments/environment";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
    private pusher: Pusher;

    constructor() {
    this.pusher = new Pusher(environment.APP_KEY , {
      cluster: environment.CLUSTER,
    });
  }

  suscribirse(canal: string, evento: string, callback: (data: any) => void) {
    const channel = this.pusher.subscribe(canal);
    channel.bind(evento, callback);
  }

  // Valor inicial de 0 notificaciones
  private id_work_progress = new BehaviorSubject<number>(0);

  // Observable para que otros lo escuchen
  id_work_progress$ = this.id_work_progress.asObservable();

  // Método para actualizar el valor
  setNotificationCount(count: number) {
    this.id_work_progress.next(count);
  }

}