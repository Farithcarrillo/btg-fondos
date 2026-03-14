import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AlertService } from './alert.service';

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AlertService);
        service.clearAll();
    });

    it('debería iniciar sin alertas', () => {
        expect(service.alerts().length).toBe(0);
    });

    it('debería agregar alerta de éxito', () => {
        service.success('Operación exitosa', 'Éxito');
        expect(service.alerts().length).toBe(1);
        expect(service.alerts()[0].type).toBe('success');
        expect(service.alerts()[0].message).toBe('Operación exitosa');
    });

    it('debería agregar alerta de error', () => {
        service.error('Algo falló');
        expect(service.alerts()[0].type).toBe('error');
    });

    it('debería descartar alerta por ID', () => {
        service.info('Test');
        const id = service.alerts()[0].id;
        service.dismiss(id);
        expect(service.alerts().length).toBe(0);
    });

    it('debería limpiar todas las alertas', () => {
        service.success('1');
        service.error('2');
        service.warning('3');
        service.clearAll();
        expect(service.alerts().length).toBe(0);
    });
});