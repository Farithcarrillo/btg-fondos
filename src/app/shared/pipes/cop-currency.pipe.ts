import { Pipe, PipeTransform } from '@angular/core';

/** Pipe para formatear valores como moneda colombiana COP */
@Pipe({ name: 'copCurrency', standalone: true })
export class CopCurrencyPipe implements PipeTransform {
    transform(value: number | null | undefined): string {
        if (value === null || value === undefined) return '$ 0';
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}