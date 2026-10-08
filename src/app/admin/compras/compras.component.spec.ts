import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ComprasComponent } from './compras.component';
import { NegocioApiService } from '../../core/services/negocio-api.service';
import { AvisosService } from '../../core/services/avisos.service';

describe('Compras: precio unitario y conservación del histórico', () => {
  const api = { guardarCompra: vi.fn().mockResolvedValue({}), compras: vi.fn().mockResolvedValue([]), materias: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Papas', precio: 3 }]) };
  let c: ComprasComponent;
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [
      { provide: NegocioApiService, useValue: api },
      { provide: AvisosService, useValue: { ok: vi.fn(), error: vi.fn() } }
    ] });
    c = TestBed.runInInjectionContext(() => new ComprasComponent());
  });
  it('recalcula cantidad × precio y envía el total con el contrato existente', async () => {
    c.lineas.at(0).patchValue({ materiaPrimaId: 1, cantidad: 2, importePagado: 3 });
    expect(c.total()).toBe(6);
    c.lineas.at(0).controls.cantidad.setValue(3);
    expect(c.total()).toBe(9);
    c.lineas.at(0).controls.cantidad.setValue(2);
    await c.guardar();
    expect(api.guardarCompra.mock.calls[0][1].detalles).toEqual([{ materiaPrimaId: 1, cantidad: 2, unidad: 'unidad', importePagado: 6 }]);
  });
  it('redondea cantidades fraccionarias y suma líneas en centavos', () => {
    c.lineas.at(0).patchValue({ cantidad: 1.5, importePagado: 3.25 });
    c.agregar();
    c.lineas.at(1).patchValue({ cantidad: 2, importePagado: 0.1 });
    expect(c.total()).toBe(5.08);
  });
  it('editar una compra antigua conserva su total exacto', async () => {
    await c.abrir({ id: 4, fechaCompra: '2026-10-07', horaConocida: false, total: 10, detalles: [{ id: 8, materiaPrimaId: 1, nombreMateriaPrima: 'Papas', cantidad: 3, unidad: 'libra', importePagado: 10, subtotal: 10 }] });
    expect(c.total()).toBe(10);
    await c.guardar();
    expect(api.guardarCompra.mock.calls[0][1].detalles[0].importePagado).toBe(10);
  });
  it('rechaza subtotales que exceden el límite del servidor', async () => {
    c.lineas.at(0).patchValue({ materiaPrimaId: 1, cantidad: 999999999, importePagado: 999999999999 });
    expect(c.importesValidos()).toBe(false);
    await c.guardar();
    expect(api.guardarCompra).not.toHaveBeenCalled();
  });
});
