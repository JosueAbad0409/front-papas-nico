import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Periodo, Reporte } from '../../core/models/negocio.model';
import { NegocioApiService } from '../../core/services/negocio-api.service';
import { AvisosService } from '../../core/services/avisos.service';
import { periodoActual } from '../../core/utils/fechas';
import { PeriodoComponent } from '../../shared/periodo/periodo.component';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, RouterLink, PeriodoComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(NegocioApiService);
  private readonly avisos = inject(AvisosService);

  readonly reporte = signal<Reporte | null>(null);
  readonly cargando = signal(false);

  readonly advertencias = computed(() =>
    Object.values(this.reporte()?.advertencias ?? {})
      .some(n => n > 0)
  );

  readonly maximo = computed(() =>
    Math.max(
      1,
      ...(this.reporte()?.productosMasVendidos.map(p => p.unidades) ?? [])
    )
  );

  private consulta = 0;

  ngOnInit() {
    void this.cargar(periodoActual('dia'));
  }

  async cargar(p: Periodo) {
    const n = ++this.consulta;
    this.cargando.set(true);
    this.reporte.set(null);

    try {
      const r = await this.api.reporte(p);

      if (n === this.consulta) {
        this.reporte.set(r);
      }
    } catch (e) {
      if (n === this.consulta) {
        this.avisos.error(e);
      }
    } finally {
      if (n === this.consulta) {
        this.cargando.set(false);
      }
    }
  }
}