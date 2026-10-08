import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Dia, Periodo, Reporte, Venta } from '../../core/models/negocio.model';
import { NegocioApiService } from '../../core/services/negocio-api.service';
import { AvisosService } from '../../core/services/avisos.service';
import { mostrarFecha, periodoActual } from '../../core/utils/fechas';
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
  readonly ventas = signal<Venta[]>([]);
  readonly mostrarFecha = mostrarFecha;
  readonly mensual = computed(() => (this.reporte()?.resumenPorDia.length ?? 0) > 62);
  readonly resumen = computed(() => {
    const dias = this.reporte()?.resumenPorDia ?? [];
    if (!this.mensual()) return dias;
    const meses = new Map<string, Dia>();
    for (const d of dias) {
      const fecha = d.fecha.slice(0, 7);
      const m = meses.get(fecha) ?? { fecha, operaciones: 0, unidades: 0, vendido: 0, compras: 0, balance: 0 };
      m.operaciones += d.operaciones;
      m.unidades += d.unidades;
      m.vendido += d.vendido;
      m.compras += d.compras;
      m.balance += d.balance;
      meses.set(fecha, m);
    }
    return [...meses.values()];
  });
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
    this.ventas.set([]);

    try {
      const [r, ventas] = await Promise.all([
        this.api.reporte(p),
        p.desde === p.hasta ? this.api.ventas(p) : Promise.resolve([])
      ]);

      if (n === this.consulta) {
        this.reporte.set(r);
        this.ventas.set(ventas);
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