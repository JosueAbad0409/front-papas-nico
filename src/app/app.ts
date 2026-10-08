import { ActualizacionService } from './core/services/actualizacion.service';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class App {
  readonly actualizacion = inject(ActualizacionService);
}