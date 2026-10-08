import { TestBed } from '@angular/core/testing';
import { PeriodoComponent } from './periodo.component';

describe('Selección de períodos históricos', () => {
  it('consulta cada día independientemente y permite semana, mes y año', () => {
    const c = TestBed.runInInjectionContext(() => new PeriodoComponent());
    const rangos: unknown[] = [];
    c.cambio.subscribe(p => rangos.push(p));
    c.fecha = '2026-10-07'; c.seleccionar();
    c.fecha = '2026-10-08'; c.seleccionar();
    c.tipo = 'semana'; c.seleccionar();
    c.tipo = 'mes'; c.mes = '2028-02'; c.seleccionar();
    c.tipo = 'anio'; c.anio = 2028; c.seleccionar();
    expect(rangos).toEqual([
      { desde: '2026-10-07', hasta: '2026-10-07' },
      { desde: '2026-10-08', hasta: '2026-10-08' },
      { desde: '2026-10-05', hasta: '2026-10-11' },
      { desde: '2028-02-01', hasta: '2028-02-29' },
      { desde: '2028-01-01', hasta: '2028-12-31' }
    ]);
  });
});
