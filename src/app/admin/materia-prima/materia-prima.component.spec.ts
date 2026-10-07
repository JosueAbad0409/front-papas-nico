import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MateriaPrimaComponent } from './materia-prima.component';
import { AvisosService } from '../../core/services/avisos.service';

describe('Precio de materia prima: formulario y API', () => {
  let component: MateriaPrimaComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaPrimaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AvisosService, useValue: { ok: vi.fn(), error: vi.fn() } }
      ]
    }).compileComponents();
    component = TestBed.createComponent(MateriaPrimaComponent).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function guardar(method: string, url: string, precio: number | null) {
    const pending = component.guardar();
    const request = http.expectOne(url);
    expect(request.request.method).toBe(method);
    expect(request.request.body).toEqual({ nombre: 'Papas (quintal)', precio });
    request.flush({ id: 7, nombre: 'Papas (quintal)', precio });
    await Promise.resolve();
    http.expectOne('/api/materia-prima').flush([
      { id: 7, nombre: 'Papas (quintal)', precio }
    ]);
    await pending;
    expect(component.materias()[0].precio).toBe(precio);
    expect(component.modal()).toBe(false);
  }

  it('envía el precio al crear y actualiza el catálogo', async () => {
    component.abrir();
    component.form.setValue({ nombre: ' Papas (quintal) ', precio: 25.40 });
    await guardar('POST', '/api/materia-prima', 25.40);
  });

  it('conserva el precio existente al editar solo el nombre', async () => {
    component.abrir({ id: 7, nombre: 'Papas', precio: 25.40 });
    component.form.controls.nombre.setValue('Papas (quintal)');
    await guardar('PUT', '/api/materia-prima/7', 25.40);
  });

  it('permite insumos históricos sin precio sin convertirlos en cero', async () => {
    component.abrir({ id: 7, nombre: 'Papas (quintal)', precio: null });
    await guardar('PUT', '/api/materia-prima/7', null);
  });

  it('conserva un precio cero explícito', async () => {
    component.abrir({ id: 7, nombre: 'Papas (quintal)', precio: 0 });
    await guardar('PUT', '/api/materia-prima/7', 0);
  });

  it('rechaza negativos, exceso de decimales e importes fuera de rango', async () => {
    component.abrir();
    component.form.controls.nombre.setValue('Papas');
    for (const precio of [-1, 1.234, 1000000000000]) {
      component.form.controls.precio.setValue(precio);
      expect(component.form.invalid).toBe(true);
      await component.guardar();
      http.expectNone('/api/materia-prima');
    }
  });
});
