import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';

@Injectable({ providedIn: 'root' })
export class ActualizacionService {
  private readonly sw = inject(SwUpdate, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  readonly disponible = signal(false);

  constructor() {
    if (!this.sw?.isEnabled) return;
    this.sw.versionUpdates.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event.type === 'VERSION_READY') this.disponible.set(true);
    });
    const comprobar = () => {
      if (document.visibilityState === 'visible') {
        void this.sw!.checkForUpdate().catch(() => { /* Reintentar al volver con conexión. */ });
      }
    };
    document.addEventListener('visibilitychange', comprobar);
    this.destroyRef.onDestroy(() => document.removeEventListener('visibilitychange', comprobar));
  }

  actualizar() {
    // La nueva versión se activa al recargar; nunca recargar un formulario automáticamente.
    if (window.confirm('Guarda primero cualquier venta o compra abierta. ¿Recargar para actualizar Papas Nico?')) {
      window.location.reload();
    }
  }
}
