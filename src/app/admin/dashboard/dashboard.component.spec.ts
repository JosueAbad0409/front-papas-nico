import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { NegocioApiService } from '../../core/services/negocio-api.service';
import { AvisosService } from '../../core/services/avisos.service';
import { Reporte } from '../../core/models/negocio.model';

describe('Dashboard por período', () => {
  it('envía el mismo día a ventas y reporte y descarta respuestas anteriores', async () => {
    let resolver!: (r: Reporte) => void;
    const api = { reporte: vi.fn().mockImplementationOnce(() => new Promise<Reporte>(r => resolver = r)).mockResolvedValue({ desde: '2026-10-08' }), ventas: vi.fn().mockResolvedValue([]) };
    TestBed.configureTestingModule({ providers: [{ provide: NegocioApiService, useValue: api }, { provide: AvisosService, useValue: { error: vi.fn() } }] });
    const c = TestBed.runInInjectionContext(() => new DashboardComponent());
    const anterior = c.cargar({ desde: '2026-10-07', hasta: '2026-10-07' });
    await c.cargar({ desde: '2026-10-08', hasta: '2026-10-08' });
    resolver({ desde: '2026-10-07' } as Reporte);
    await anterior;
    expect(c.reporte()?.desde).toBe('2026-10-08');
    expect(api.ventas).toHaveBeenLastCalledWith({ desde: '2026-10-08', hasta: '2026-10-08' });
  });
});
