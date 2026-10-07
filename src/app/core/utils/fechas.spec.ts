import {
  ahoraEcuador,
  periodoActual,
  fechaApi,
  centavos
} from './fechas';

describe('Fechas de Ecuador y dinero', () => {
  it('mantiene el día anterior antes de las 05:00 UTC', () => {
    expect(
      ahoraEcuador(new Date('2026-10-07T04:59:00Z'))
    ).toBe('2026-10-06T23:59');
  });

  it('calcula semana de lunes a domingo y fin de mes', () => {
    expect(
      periodoActual('semana', '2026-10-07')
    ).toEqual({
      desde: '2026-10-05',
      hasta: '2026-10-11'
    });

    expect(
      periodoActual('mes', '2028-02-10')
    ).toEqual({
      desde: '2028-02-01',
      hasta: '2028-02-29'
    });
  });

  it('envía offset explícito y calcula centavos', () => {
    expect(
      fechaApi('2026-10-06T10:00')
    ).toBe('2026-10-06T10:00:00-05:00');

    expect(
      (centavos(4) * 5 + centavos(4) * 2) / 100
    ).toBe(28);
  });
});