import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Compra,
  LineaCompra,
  MateriaPrima,
  Periodo
} from '../../core/models/negocio.model';
import { NegocioApiService } from '../../core/services/negocio-api.service';
import { AvisosService } from '../../core/services/avisos.service';
import {
  ahoraEcuador,
  fechaApi,
  fechaInput,
  mostrarFecha,
  periodoActual,
  centavos
} from '../../core/utils/fechas';
import { PeriodoComponent } from '../../shared/periodo/periodo.component';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-compras',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    PeriodoComponent,
    ModalComponent
  ],
  templateUrl: './compras.component.html'
})
export class ComprasComponent implements OnInit {
  private readonly api = inject(NegocioApiService);
  private readonly avisos = inject(AvisosService);
  private readonly fb = inject(FormBuilder);

  readonly compras = signal<Compra[]>([]);
  readonly materias = signal<MateriaPrima[]>([]);
  readonly cargando = signal(false);
  readonly ocupado = signal(false);
  readonly modal = signal(false);
  readonly detalle = signal<Compra | null>(null);
  readonly mostrarFecha = mostrarFecha;

  // NUEVO: Total del historial de compras del período actual
  readonly totalHistorial = computed(() =>
    this.compras().reduce((s, c) => s + c.total, 0)
  );

  id: number | null = null;
  private fechaOriginal = '';
  private consulta = 0;

  periodo: Periodo = periodoActual('dia');

  readonly form = this.fb.nonNullable.group({
    fecha: [ahoraEcuador(), Validators.required],
    detalles: this.fb.array([this.grupo()])
  });

  get lineas() {
    return this.form.controls.detalles;
  }

  private grupo(d?: LineaCompra) {
    return this.fb.nonNullable.group({
      materiaPrimaId: [
        d?.materiaPrimaId ?? 0,
        [Validators.required, Validators.min(1)]
      ],
      cantidad: [
        d?.cantidad ?? 1,
        [
          Validators.required,
          Validators.min(0.001),
          Validators.max(999999999.999),
          Validators.pattern(/^\d+(\.\d{1,3})?$/)
        ]
      ],
      unidad: [
        d?.unidad ?? 'unidad',
        [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.maxLength(40)
        ]
      ],
      modo: [d ? 'total' : 'unitario'],
      importePagado: [
        d?.importePagado ?? 0,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(999999999999.99),
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]
      ]
    });
  }

  ngOnInit() {
    void this.cargar();
  }

  async cargar(p = this.periodo) {
    this.periodo = p;
    const n = ++this.consulta;
    this.cargando.set(true);

    try {
      const compras = await this.api.compras(p);

      if (n === this.consulta) {
        this.compras.set(compras);
      }
    } catch (e) {
      if (n === this.consulta) {
        this.compras.set([]);
        this.avisos.error(e);
      }
    } finally {
      if (n === this.consulta) {
        this.cargando.set(false);
      }
    }
  }

  async abrir(c?: Compra) {
    if (this.ocupado()) {
      return;
    }

    if (
      c?.detalles.some(d =>
        d.importePagado === null || d.unidad === null
      )
    ) {
      this.avisos.error(
        new Error(
          'La compra tiene importes o unidades históricos incompletos.'
        )
      );
      return;
    }

    this.ocupado.set(true);

    try {
      this.materias.set(await this.api.materias());

      if (!this.materias().length) {
        this.avisos.error(
          new Error(
            'Primero registra al menos un insumo en Materia prima.'
          )
        );
        return;
      }

      this.id = c?.id ?? null;
      this.fechaOriginal = c ? fechaInput(c.fechaCompra) : '';

      this.form.controls.fecha.setValue(
        c ? this.fechaOriginal : ahoraEcuador()
      );

      this.lineas.clear();

      if (c) {
        for (const d of c.detalles) {
          this.lineas.push(
            this.grupo({
              materiaPrimaId: d.materiaPrimaId,
              cantidad: d.cantidad,
              unidad: d.unidad!,
              importePagado: d.importePagado!
            })
          );
        }
      } else {
        this.lineas.push(this.grupo());
      }

      this.form.markAsPristine();
      this.form.markAsUntouched();
      this.modal.set(true);
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.ocupado.set(false);
    }
  }

  agregar() {
    if (!this.ocupado() && this.lineas.length < 200) {
      this.lineas.push(this.grupo());
    }
  }

  quitar(i: number) {
    if (!this.ocupado() && this.lineas.length > 1) {
      this.lineas.removeAt(i);
    }
  }

  subtotal(i: number) {
    const d = this.lineas.at(i).getRawValue();
    return centavos((d.importePagado || 0) * (d.modo === 'unitario' ? d.cantidad || 0 : 1)) / 100;
  }

  importesValidos() {
    return this.lineas.controls.every((_, i) => Number.isFinite(this.subtotal(i)) && this.subtotal(i) <= 999999999999.99);
  }

  total() {
    return this.lineas.getRawValue().reduce(
      (s, d, i) => s + centavos(this.subtotal(i)),
      0
    ) / 100;
  }

  async guardar() {
    if (
      this.ocupado() ||
      this.form.invalid ||
      !this.importesValidos() ||
      !this.lineas.length
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.ocupado.set(true);

    try {
      const v = this.form.getRawValue();

      await this.api.guardarCompra(this.id, {
        ...(
          this.id === null || v.fecha !== this.fechaOriginal
            ? { fechaCompra: fechaApi(v.fecha) }
            : {}
        ),
        detalles: v.detalles.map((d, i) => ({
          materiaPrimaId: d.materiaPrimaId,
          cantidad: d.cantidad,
          importePagado: this.subtotal(i),
          unidad: d.unidad.trim()
        }))
      });

      this.modal.set(false);
      this.avisos.ok('Compra guardada');
      await this.cargar();
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.ocupado.set(false);
    }
  }

  async eliminar(c: Compra) {
    if (
      this.ocupado() ||
      !await this.avisos.confirmar(
        `Eliminar la compra #${c.id} por $${c.total.toFixed(2)}. ` +
        'Se descontará de los reportes.'
      )
    ) {
      return;
    }

    this.ocupado.set(true);

    try {
      await this.api.eliminarCompra(c.id);
      this.detalle.set(null);
      this.avisos.ok('Compra eliminada');
      await this.cargar();
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.ocupado.set(false);
    }
  }
}