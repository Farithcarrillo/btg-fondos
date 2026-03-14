import { describe, it, expect, beforeEach } from 'vitest';
import { CopCurrencyPipe } from './cop-currency.pipe';

describe('CopCurrencyPipe', () => {
    let pipe: CopCurrencyPipe;

    beforeEach(() => { pipe = new CopCurrencyPipe(); });

    it('debería formatear como COP', () => {
        expect(pipe.transform(500000)).toContain('500.000');
    });

    it('debería retornar "$ 0" para null', () => {
        expect(pipe.transform(null)).toBe('$ 0');
    });

    it('debería retornar "$ 0" para undefined', () => {
        expect(pipe.transform(undefined)).toBe('$ 0');
    });

    it('debería formatear valores pequeños', () => {
        expect(pipe.transform(75000)).toContain('75.000');
    });
});