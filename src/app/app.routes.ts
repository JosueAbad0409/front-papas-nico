import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard | Papas Nico',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'ventas',
        title: 'Ventas | Papas Nico',
        loadComponent: () =>
          import('./admin/ventas/ventas.component')
            .then(m => m.VentasComponent)
      },
      {
        path: 'comidas',
        title: 'Menú | Papas Nico',
        loadComponent: () =>
          import('./admin/comidas/comidas.component')
            .then(m => m.ComidasComponent)
      },
      {
        path: 'materia-prima',
        title: 'Materia prima | Papas Nico',
        loadComponent: () =>
          import('./admin/materia-prima/materia-prima.component')
            .then(m => m.MateriaPrimaComponent)
      },
      {
        path: 'compras',
        title: 'Compras | Papas Nico',
        loadComponent: () =>
          import('./admin/compras/compras.component')
            .then(m => m.ComprasComponent)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'admin/dashboard'
  },
  {
    path: '**',
    redirectTo: 'admin/dashboard'
  }
];