export interface Comida {
  id: number;
  nombre: string;
  foto_url: string | null;
  precio: number;
}

export interface MateriaPrima {
  id: number;
  nombre: string;
  precio: number | null;
}

export interface Periodo {
  desde: string;
  hasta: string;
}

export interface DetalleVenta {
  id: number;
  comidaId: number;
  nombreComida: string;
  cantidad: number;
  precioUnitario: number | null;
  subtotal: number | null;
}

export interface Venta {
  id: number;
  fechaCompra: string;
  horaConocida: boolean;
  total: number;
  detalles: DetalleVenta[];
}

export interface VentaRequest {
  fechaCompra?: string;
  detalles: {
    comidaId: number;
    cantidad: number;
  }[];
}

export interface LineaCompra {
  materiaPrimaId: number;
  cantidad: number;
  unidad: string;
  importePagado: number;
}

export interface DetalleCompra
  extends Omit<LineaCompra, 'unidad' | 'importePagado'> {
  id: number;
  nombreMateriaPrima: string;
  unidad: string | null;
  importePagado: number | null;
  subtotal: number | null;
}

export interface Compra {
  id: number;
  fechaCompra: string;
  horaConocida: boolean;
  total: number;
  detalles: DetalleCompra[];
}

export interface CompraRequest {
  fechaCompra?: string;
  detalles: LineaCompra[];
}

export interface Dia {
  fecha: string;
  operaciones: number;
  unidades: number;
  vendido: number;
  compras: number;
  balance: number;
}

export interface Reporte {
  desde: string;
  hasta: string;
  zonaHoraria: string;
  totalVendido: number;
  unidadesVendidas: number;
  operacionesVenta: number;
  totalCompras: number;
  balance: number;
  resumenPorDia: Dia[];
  diasMasUnidades: string[];
  diasMayoresIngresos: string[];
  productosMasVendidos: {
    comidaId: number;
    nombre: string;
    unidades: number;
  }[];
  advertencias: Record<string, number>;
}