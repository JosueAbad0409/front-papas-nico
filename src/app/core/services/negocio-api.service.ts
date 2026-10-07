import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Comida,
  MateriaPrima,
  Venta,
  VentaRequest,
  Compra,
  CompraRequest,
  Periodo,
  Reporte
} from '../models/negocio.model';

@Injectable({ providedIn: 'root' })
export class NegocioApiService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  comidas() {
    return firstValueFrom(
      this.http.get<Comida[]>(`${this.url}/comidas`)
    );
  }

  guardarComida(
    id: number | null,
    datos: { nombre: string; precio: number },
    imagen: File | null
  ) {
    const body = new FormData();

    body.append(
      'comida',
      new Blob([JSON.stringify(datos)], {
        type: 'application/json'
      })
    );

    if (imagen) {
      body.append('imagen', imagen);
    }

    return firstValueFrom(
      id === null
        ? this.http.post<Comida>(`${this.url}/comidas`, body)
        : this.http.put<Comida>(`${this.url}/comidas/${id}`, body)
    );
  }

  eliminarComida(id: number) {
    return firstValueFrom(
      this.http.delete(`${this.url}/comidas/${id}`)
    );
  }

  materias() {
    return firstValueFrom(
      this.http.get<MateriaPrima[]>(`${this.url}/materia-prima`)
    );
  }

  guardarMateria(id: number | null, nombre: string) {
    return firstValueFrom(
      id === null
        ? this.http.post<MateriaPrima>(
            `${this.url}/materia-prima`,
            { nombre }
          )
        : this.http.put<MateriaPrima>(
            `${this.url}/materia-prima/${id}`,
            { nombre }
          )
    );
  }

  eliminarMateria(id: number) {
    return firstValueFrom(
      this.http.delete(`${this.url}/materia-prima/${id}`)
    );
  }

  ventas(p: Periodo) {
    return firstValueFrom(
      this.http.get<Venta[]>(`${this.url}/ventas`, {
        params: { ...p }
      })
    );
  }

  guardarVenta(id: number | null, body: VentaRequest) {
    return firstValueFrom(
      id === null
        ? this.http.post<Venta>(`${this.url}/ventas`, body)
        : this.http.put<Venta>(`${this.url}/ventas/${id}`, body)
    );
  }

  eliminarVenta(id: number) {
    return firstValueFrom(
      this.http.delete(`${this.url}/ventas/${id}`)
    );
  }

  compras(p: Periodo) {
    return firstValueFrom(
      this.http.get<Compra[]>(`${this.url}/compras-mp`, {
        params: { ...p }
      })
    );
  }

  guardarCompra(id: number | null, body: CompraRequest) {
    return firstValueFrom(
      id === null
        ? this.http.post<Compra>(`${this.url}/compras-mp`, body)
        : this.http.put<Compra>(`${this.url}/compras-mp/${id}`, body)
    );
  }

  eliminarCompra(id: number) {
    return firstValueFrom(
      this.http.delete(`${this.url}/compras-mp/${id}`)
    );
  }

  reporte(p: Periodo) {
    return firstValueFrom(
      this.http.get<Reporte>(`${this.url}/reportes`, {
        params: { ...p }
      })
    );
  }
}