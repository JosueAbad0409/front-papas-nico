import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Periodo } from '../../core/models/negocio.model';
import { hoyEcuador, periodoActual } from '../../core/utils/fechas';

type Tipo = 'dia' | 'semana' | 'mes' | 'anio' | 'personalizado';

@Component({
  selector: 'app-periodo',
  imports: [FormsModule],
  template: `
    <form class="filters" (ngSubmit)="aplicar()">
      <label>Ver por
        <select name="tipo" [(ngModel)]="tipo" (ngModelChange)="seleccionar()" [disabled]="ocupado()">
          <option value="dia">Día</option><option value="semana">Semana</option>
          <option value="mes">Mes</option><option value="anio">Año</option>
          <option value="personalizado">Rango personalizado</option>
        </select>
      </label>
      @if (tipo === 'dia' || tipo === 'semana') {
        <label>{{ tipo === 'dia' ? 'Fecha' : 'Un día de la semana' }}
          <input type="date" name="fecha" [(ngModel)]="fecha" (ngModelChange)="seleccionar()" required [disabled]="ocupado()">
        </label>
      } @else if (tipo === 'mes') {
        <label>Mes<input type="month" name="mes" [(ngModel)]="mes" (ngModelChange)="seleccionar()" required [disabled]="ocupado()"></label>
      } @else if (tipo === 'anio') {
        <label>Año<input type="number" name="anio" [(ngModel)]="anio" (ngModelChange)="seleccionar()" min="1900" max="9999" step="1" required [disabled]="ocupado()"></label>
      } @else {
        <label>Desde<input type="date" name="desde" [(ngModel)]="desde" required [disabled]="ocupado()"></label>
        <label>Hasta<input type="date" name="hasta" [(ngModel)]="hasta" [min]="desde" required [disabled]="ocupado()"></label>
      }
      <button class="primary" [disabled]="ocupado() || !valido()">Consultar</button>
      <button type="button" (click)="hoy()" [disabled]="ocupado()">Hoy</button>
      @if (tipo === 'semana') { <small>De lunes a domingo.</small> }
      @if (!valido()) { <span class="error">Selecciona una fecha o rango válido.</span> }
    </form>
  `
})
export class PeriodoComponent {
  readonly ocupado = input(false);
  readonly cambio = output<Periodo>();
  tipo: Tipo = 'dia';
  fecha = hoyEcuador();
  mes = this.fecha.slice(0, 7);
  anio = Number(this.fecha.slice(0, 4));
  desde = this.fecha;
  hasta = this.fecha;

  valido() {
    if (this.tipo === 'anio') return Number.isInteger(this.anio) && this.anio >= 1900 && this.anio <= 9999;
    if (this.tipo === 'mes') return /^\d{4}-\d{2}$/.test(this.mes);
    if (this.tipo !== 'personalizado') return !!this.fecha;
    return !!this.desde && !!this.hasta && this.desde <= this.hasta;
  }

  seleccionar() {
    if (!this.valido() || this.ocupado()) return;
    if (this.tipo !== 'personalizado') {
      const base = this.tipo === 'anio' ? `${this.anio}-01-01` : this.tipo === 'mes' ? `${this.mes}-01` : this.fecha;
      const p = periodoActual(this.tipo, base);
      this.desde = p.desde;
      this.hasta = p.hasta;
      this.cambio.emit(p);
    }
  }

  aplicar() {
    if (!this.valido() || this.ocupado()) return;
    if (this.tipo === 'personalizado') this.cambio.emit({ desde: this.desde, hasta: this.hasta });
    else this.seleccionar();
  }

  hoy() {
    this.tipo = 'dia';
    this.fecha = hoyEcuador();
    this.seleccionar();
  }
}
