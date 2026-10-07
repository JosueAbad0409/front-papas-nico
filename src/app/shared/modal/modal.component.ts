import { Component, input, output } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'app-modal',
    imports: [A11yModule],
    template: `
    <div class="modal-backdrop">
      <section
        class="modal"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="titulo()"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        (keydown.escape)="cerrar()"
      >
        <header class="modal-header">
          <h2>{{ titulo() }}</h2>

          <button
            type="button"
            class="icon-btn"
            aria-label="Cerrar ventana"
            [disabled]="ocupado()"
            (click)="cerrar()"
          >
            ✕
          </button>
        </header>

        <ng-content />
      </section>
    </div>
  `
})
export class ModalComponent {
    readonly titulo = input.required<string>();
    readonly ocupado = input(false);
    readonly cerrado = output<void>();

    cerrar() {
        if (!this.ocupado()) {
            this.cerrado.emit();
        }
    }
}