import { Component, effect, input, signal } from '@angular/core';

@Component({
    selector: 'app-foto',
    template: `
    @if (src() && !fallo()) {
      <img
        [src]="src()"
        [alt]="nombre()"
        loading="lazy"
        (error)="fallo.set(true)"
      >
    } @else {
      <div
        class="photo-empty"
        role="img"
        [attr.aria-label]="nombre() + ': sin fotografía'"
      >
        N
        <span>PAPAS NICO</span>
      </div>
    }
  `,
    styles: `
    :host {
      display: block;
    }

    img {
      display: block;
      width: 100%;
      height: 160px;
      object-fit: cover;
    }
  `
})
export class FotoComponent {
    readonly src = input<string | null>(null);
    readonly nombre = input('Comida');
    readonly fallo = signal(false);

    constructor() {
        effect(() => {
            this.src();
            this.fallo.set(false);
        });
    }
}