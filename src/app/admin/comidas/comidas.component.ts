import {
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule
} from '@angular/forms';
import { Comida } from '../../core/models/negocio.model';
import { NegocioApiService } from '../../core/services/negocio-api.service';
import { AvisosService } from '../../core/services/avisos.service';
import { ModalComponent } from '../../shared/modal/modal.component';
import { FotoComponent } from '../../shared/foto/foto.component';

@Component({
  selector: 'app-comidas',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    FormsModule,
    ModalComponent,
    FotoComponent
  ],
  templateUrl: './comidas.component.html'
})
export class ComidasComponent implements OnInit {
  private readonly api = inject(NegocioApiService);
  private readonly avisos = inject(AvisosService);
  private readonly fb = inject(FormBuilder);

  readonly comidas = signal<Comida[]>([]);
  readonly cargando = signal(false);
  readonly ocupado = signal(false);
  readonly modal = signal(false);
  readonly buscar = signal('');

  readonly visibles = computed(() =>
    this.comidas().filter(c =>
      c.nombre.toLowerCase().includes(this.buscar().toLowerCase())
    )
  );

  id: number | null = null;
  imagen: File | null = null;
  preview: string | null = null;
  private temporal: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(255)
      ]
    ],
    precio: [
      0,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999999999.99),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]
    ]
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.limpiarFoto());
  }

  ngOnInit() {
    void this.cargar();
  }

  async cargar() {
    this.cargando.set(true);

    try {
      this.comidas.set(await this.api.comidas());
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.cargando.set(false);
    }
  }

  abrir(c?: Comida) {
    this.limpiarFoto();
    this.id = c?.id ?? null;
    this.imagen = null;
    this.preview = c?.foto_url ?? null;

    this.form.reset({
      nombre: c?.nombre ?? '',
      precio: c?.precio ?? 0
    });

    this.modal.set(true);
  }

  foto(event: Event) {
    const archivo = (event.target as HTMLInputElement).files?.[0];

    if (!archivo) {
      return;
    }

    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) ||
      archivo.size > 5 * 1024 * 1024
    ) {
      this.avisos.error(
        new Error('Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.')
      );
      return;
    }

    this.limpiarFoto();
    this.imagen = archivo;
    this.temporal = URL.createObjectURL(archivo);
    this.preview = this.temporal;
  }

  cerrar() {
    if (!this.ocupado()) {
      this.modal.set(false);
      this.limpiarFoto();
    }
  }

  private limpiarFoto() {
    if (this.temporal) {
      URL.revokeObjectURL(this.temporal);
    }

    this.temporal = null;
  }

  async guardar() {
    if (this.ocupado()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.ocupado.set(true);

    try {
      const v = this.form.getRawValue();

      await this.api.guardarComida(
        this.id,
        { ...v, nombre: v.nombre.trim() },
        this.imagen
      );

      this.modal.set(false);
      this.limpiarFoto();
      this.avisos.ok('Comida guardada');
      await this.cargar();
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.ocupado.set(false);
    }
  }

  async eliminar(c: Comida) {
    if (
      this.ocupado() ||
      !await this.avisos.confirmar(
        `Eliminar ${c.nombre}. Si tiene ventas registradas, ` +
        'el servidor protegerá su historial.'
      )
    ) {
      return;
    }

    this.ocupado.set(true);

    try {
      await this.api.eliminarComida(c.id);
      this.comidas.update(lista => lista.filter(x => x.id !== c.id));
      this.avisos.ok('Comida eliminada');
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.ocupado.set(false);
    }
  }
}