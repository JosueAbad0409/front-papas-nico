import { Periodo } from '../models/negocio.model';

export function ahoraEcuador(fecha = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(fecha);

  const p = (tipo: string) =>
    partes.find(x => x.type === tipo)?.value ?? '';

  return `${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}`;
}

export const hoyEcuador = () => ahoraEcuador().slice(0, 10);

export const fechaApi = (local: string) => `${local}:00-05:00`;

export function fechaInput(iso: string): string {
  return iso.includes('T')
    ? ahoraEcuador(new Date(iso))
    : `${iso}T00:00`;
}

export function mostrarFecha(iso: string, hora = true): string {
  if (!iso) {
    return 'Sin fecha';
  }

  if (!iso.includes('T')) {
    return iso + (hora ? ' · hora desconocida' : '');
  }

  return new Intl.DateTimeFormat('es-EC', {
    timeZone: 'America/Guayaquil',
    dateStyle: 'medium',
    ...(hora ? { timeStyle: 'short' as const } : {})
  }).format(new Date(iso));
}

export function periodoActual(
  tipo: 'dia' | 'semana' | 'mes' | 'anio',
  hoy = hoyEcuador()
): Periodo {
  const base = new Date(`${hoy}T12:00:00Z`);
  const desde = new Date(base);
  const hasta = new Date(base);

  if (tipo === 'semana') {
    desde.setUTCDate(
      base.getUTCDate() - (base.getUTCDay() + 6) % 7
    );

    hasta.setTime(desde.getTime());
    hasta.setUTCDate(desde.getUTCDate() + 6);
  }

  if (tipo === 'mes') {
    desde.setUTCDate(1);
    hasta.setUTCMonth(base.getUTCMonth() + 1, 0);
  }

  if (tipo === 'anio') {
    desde.setUTCMonth(0, 1);
    hasta.setUTCMonth(11, 31);
  }

  return {
    desde: desde.toISOString().slice(0, 10),
    hasta: hasta.toISOString().slice(0, 10)
  };
}

export const centavos = (valor: number) =>
  Math.round((Number(valor) + Number.EPSILON) * 100);