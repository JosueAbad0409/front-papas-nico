import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Periodo } from '../../core/models/negocio.model';
import { periodoActual } from '../../core/utils/fechas';

@Component({
    selector: 'app-periodo',
    imports: [FormsModule],
    template: `
    <form class="filters" (ngSubmit)="aplicar()">
      <div class="presets">
        <button
          type="button"
          [disabled]="ocupado()"
          (click)="rapido('dia')"
        >
          Hoy
        </button>

        <button
          type="button"
          [disabled]="ocupado()"
          (click)="rapido('semana')"
        >
          Esta semana
        </button>

        <button
          type="button"
          [disabled]="ocupado()"
          (click)="rapido('mes')"
        >
          Este mes
        </button>
      </div>

      <label>
        Desde
        <input
          type="date"
          name="desde"
          [(ngModel)]="desde"
          required
          [disabled]="ocupado()"
        >
      </label>

      <label>
        Hasta
        <input
          type="date"
          name="hasta"
          [(ngModel)]="hasta"
          required
          [min]="desde"
          [disabled]="ocupado()"
        >
      </label>

      <button
        class="primary"
        [disabled]="ocupado() || !desde || !hasta || desde > hasta"
      >
        Consultar
      </button>

      @if (desde > hasta) {
        <span class="error">Revisa el orden de las fechas.</span>
      }
    </form>
  `
})
export class PeriodoComponent {
    readonly ocupado = input(false);
    readonly cambio = output<Periodo>();

    desde = periodoActual('dia').desde;
    hasta = this.desde;

    aplicar() {
        if (this.desde && this.hasta && this.desde <= this.hasta) {
            this.cambio.emit({
                desde: this.desde,
                hasta: this.hasta
            });
        }
    }

    rapido(tipo: 'dia' | 'semana' | 'mes') {
        const p = periodoActual(tipo);
        this.desde = p.desde;
        this.hasta = p.hasta;
        this.aplicar();
    }
}