import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MateriaPrima } from '../../core/models/negocio.model';
import { NegocioApiService } from '../../core/services/negocio-api.service';
import { AvisosService } from '../../core/services/avisos.service';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-materia-prima',
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './materia-prima.component.html'
})
export class MateriaPrimaComponent implements OnInit {
  private readonly api = inject(NegocioApiService);
  private readonly avisos = inject(AvisosService);

  readonly materias = signal<MateriaPrima[]>([]);
  readonly cargando = signal(false);
  readonly ocupado = signal(false);
  readonly modal = signal(false);

  id: number | null = null;

  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(255)
      ]
    ]
  });

  ngOnInit() {
    void this.cargar();
  }

  async cargar() {
    this.cargando.set(true);

    try {
      this.materias.set(await this.api.materias());
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.cargando.set(false);
    }
  }

  abrir(m?: MateriaPrima) {
    this.id = m?.id ?? null;
    this.form.reset({ nombre: m?.nombre ?? '' });
    this.modal.set(true);
  }

  async guardar() {
    if (this.ocupado() || this.form.invalid) {
      return;
    }

    this.ocupado.set(true);

    try {
      await this.api.guardarMateria(
        this.id,
        this.form.getRawValue().nombre.trim()
      );

      this.modal.set(false);
      this.avisos.ok('Materia prima guardada');
      await this.cargar();
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.ocupado.set(false);
    }
  }

  async eliminar(m: MateriaPrima) {
    if (
      this.ocupado() ||
      !await this.avisos.confirmar(
        `Eliminar ${m.nombre}. ` +
        'No se podrá eliminar si tiene compras registradas.'
      )
    ) {
      return;
    }

    this.ocupado.set(true);

    try {
      await this.api.eliminarMateria(m.id);
      this.materias.update(lista => lista.filter(x => x.id !== m.id));
      this.avisos.ok('Materia prima eliminada');
    } catch (e) {
      this.avisos.error(e);
    } finally {
      this.ocupado.set(false);
    }
  }
}