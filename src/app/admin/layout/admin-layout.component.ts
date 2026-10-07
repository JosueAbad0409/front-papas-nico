import { Component, signal } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  readonly abierto = signal(false);

  readonly links = [
    { ruta: 'dashboard', nombre: 'Dashboard', icono: '◈' },
    { ruta: 'ventas', nombre: 'Ventas', icono: '＋' },
    { ruta: 'comidas', nombre: 'Menú de comidas', icono: '▦' },
    { ruta: 'materia-prima', nombre: 'Materia prima', icono: '◇' },
    { ruta: 'compras', nombre: 'Compras', icono: '▤' }
  ];
}