import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AvisosService {
  async confirmar(texto: string) {
    const resultado = await Swal.fire({
      title: '¿Continuar?',
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b84524'
    });

    return resultado.isConfirmed;
  }

  ok(texto: string) {
    void Swal.fire({
      icon: 'success',
      title: texto,
      timer: 1800,
      showConfirmButton: false
    });
  }

  error(error: unknown) {
    let texto = 'No se pudo completar la operación.';

    if (error instanceof HttpErrorResponse) {
      const body: unknown = error.error;

      if (error.status === 0) {
        texto =
          'No se pudo confirmar la respuesta del servidor. ' +
          'Si estabas guardando, revisa el historial antes de repetir la operación.';
      } else if (
        body &&
        typeof body === 'object' &&
        'mensaje' in body &&
        typeof body.mensaje === 'string'
      ) {
        texto = body.mensaje;
      } else if (error.status === 400) {
        texto = 'Revisa los campos, cantidades y fechas.';
      } else if (error.status === 409) {
        texto =
          'El registro está siendo utilizado o tiene datos históricos incompletos.';
      }
    } else if (error instanceof Error) {
      texto = error.message;
    }

    void Swal.fire({
      icon: 'error',
      title: 'No se pudo completar',
      text: texto,
      confirmButtonColor: '#b84524'
    });
  }
}