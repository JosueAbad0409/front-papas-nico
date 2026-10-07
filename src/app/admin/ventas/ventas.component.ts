import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Comida,
  Venta,
  Periodo
} from '../../core/models/negocio.model';
import { NegocioApiService } from '../../core/services/negocio-api.service';
import { AvisosService } from '../../core/services/avisos.service';
import {
  ahoraEcuador,
  fechaInput,
  fechaApi,
  mostrarFecha,
  periodoActual,
  centavos
} from '../../core/utils/fechas';
import { FotoComponent } from '../../shared/foto/foto.component';
import { PeriodoComponent } from '../../shared/periodo/periodo.component';
import { ModalComponent } from '../../shared/modal/modal.component';

interface Linea {
  comidaId: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

@Component({
  selector: 'app-ventas',
  imports: [
    CurrencyPipe,
    FormsModule,
    FotoComponent,
    PeriodoComponent,
    ModalComponent
  ],
  templateUrl: './ventas.component.html'
})
export class VentasComponent implements OnInit {
  private readonly api = inject(NegocioApiService);
  private readonly avisos = inject(AvisosService);

  readonly comidas = signal<Comida[]>([]);
  readonly ventas = signal<Venta[]>([]);
  readonly lineas = signal<Linea[]>([]);
  readonly buscar = signal('');

  readonly cargando = signal(false);
  readonly cargandoMenu = signal(false);
  readonly ocupado = signal(false);
  readonly editando = signal<number | null>(null);
  readonly detalle = signal<Venta | null>(null);

  readonly visibles = computed(() =>
    this.comidas().filter(c =>
      c.nombre.toLowerCase().includes(this.buscar().toLowerCase())
    )
  );

  readonly unidades = computed(() =>
    this.lineas().reduce((s, x) => s + x.cantidad, 0)
  );

  readonly total = computed(() =>
    this.lineas().reduce(
      (s, x) => s + centavos(x.precio) * x.cantidad,
      0
    ) / 100
  );

  readonly mostrarFecha = mostrarFecha;

  fecha = ahoraEcuador();
  private fechaOriginal = '';
  private preciosOriginales = new Map<number, number>();

  periodo: Periodo = periodoActual('dia');
  private consulta = 0;

  ngOnInit() {
    void this.cargarMenu();
    void this.cargar();
  }

  async cargarMenu() {
    this.cargandoMenu.set(true);

    try {
      this.comidas.set(await this.api.comidas());
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.cargandoMenu.set(false);
    }
  }

  async cargar(p = this.periodo) {
    this.periodo = p;
    const n = ++this.consulta;
    this.cargando.set(true);

    try {
      const datos = await this.api.ventas(p);

      if (n === this.consulta) {
        this.ventas.set(datos);
      }
    } catch (e) {
      if (n === this.consulta) {
        this.ventas.set([]);
        this.avisos.error(e);
      }
    } finally {
      if (n === this.consulta) {
        this.cargando.set(false);
      }
    }
  }

  agregar(c: Comida) {
    if (this.ocupado()) {
      return;
    }

    const existe = this.lineas().find(x => x.comidaId === c.id);

    if (existe) {
      this.cantidad(c.id, existe.cantidad + 1);
    } else {
      this.lineas.update(lista => [
        ...lista,
        {
          comidaId: c.id,
          nombre: c.nombre,
          cantidad: 1,
          precio: this.preciosOriginales.get(c.id) ?? c.precio
        }
      ]);
    }
  }

  cantidad(id: number, cantidad: number) {
    if (this.ocupado()) {
      return;
    }

    if (
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > 1000000
    ) {
      this.avisos.error(
        new Error('La cantidad debe ser un entero entre 1 y 1000000.')
      );
      return;
    }

    this.lineas.update(lista =>
      lista.map(x =>
        x.comidaId === id ? { ...x, cantidad } : x
      )
    );
  }

  quitar(id: number) {
    if (!this.ocupado()) {
      this.lineas.update(lista =>
        lista.filter(x => x.comidaId !== id)
      );
    }
  }

  private limpiar() {
    this.lineas.set([]);
    this.editando.set(null);
    this.fecha = ahoraEcuador();
    this.fechaOriginal = '';
    this.preciosOriginales.clear();
  }

  async nueva() {
    if (this.ocupado()) {
      return;
    }

    if (
      this.lineas().length &&
      !await this.avisos.confirmar(
        'Descartar la operación que estás preparando.'
      )
    ) {
      return;
    }

    this.limpiar();
  }

  async editar(v: Venta) {
    if (this.ocupado()) {
      return;
    }

    if (v.detalles.some(d => d.precioUnitario === null)) {
      this.avisos.error(
        new Error('La venta no tiene precios históricos completos.')
      );
      return;
    }

    if (
      this.lineas().length &&
      !await this.avisos.confirmar(
        'Cambiar a esta venta y descartar el borrador actual.'
      )
    ) {
      return;
    }

    this.editando.set(v.id);
    this.fecha = fechaInput(v.fechaCompra);
    this.fechaOriginal = this.fecha;

    this.preciosOriginales = new Map(
      v.detalles.map(d => [d.comidaId, d.precioUnitario!])
    );

    this.lineas.set(
      v.detalles.map(d => ({
        comidaId: d.comidaId,
        nombre: d.nombreComida,
        cantidad: d.cantidad,
        precio: d.precioUnitario!
      }))
    );

    this.detalle.set(null);
  }

  async guardar() {
    if (
      this.ocupado() ||
      !this.lineas().length ||
      !this.fecha
    ) {
      return;
    }

    if (this.lineas().length > 200) {
      this.avisos.error(
        new Error('Máximo 200 comidas diferentes por operación.')
      );
      return;
    }

    this.ocupado.set(true);

    try {
      const id = this.editando();

      const venta = await this.api.guardarVenta(id, {
        ...(
          id === null || this.fecha !== this.fechaOriginal
            ? { fechaCompra: fechaApi(this.fecha) }
            : {}
        ),
        detalles: this.lineas().map(x => ({
          comidaId: x.comidaId,
          cantidad: x.cantidad
        }))
      });

      this.limpiar();

      this.avisos.ok(
        `Venta #${venta.id} guardada · $${venta.total.toFixed(2)}`
      );

      await this.cargar();
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.ocupado.set(false);
    }
  }

  async eliminar(v: Venta) {
    if (
      this.ocupado() ||
      !await this.avisos.confirmar(
        `Eliminar la venta #${v.id} por $${v.total.toFixed(2)}. ` +
        'Se descontará de los reportes.'
      )
    ) {
      return;
    }

    this.ocupado.set(true);

    try {
      await this.api.eliminarVenta(v.id);

      if (this.editando() === v.id) {
        this.limpiar();
      }

      this.detalle.set(null);
      this.avisos.ok('Venta eliminada');
      await this.cargar();
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.ocupado.set(false);
    }
  }

  contar(v: Venta) {
    return v.detalles.reduce((s, x) => s + x.cantidad, 0);
  }
}