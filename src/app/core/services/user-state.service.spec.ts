import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserStateService } from './user-state.service';
import { Fund } from '@core/models';

describe('UserStateService', () => {
    let service: UserStateService;

    const mockFund: Fund = {
        id: 1, name: 'FPV_BTG_PACTUAL_RECAUDADORA', minimumAmount: 75000, category: 'FPV'
    };

    const mockFund2: Fund = {
        id: 3, name: 'DEUDAPRIVADA', minimumAmount: 50000, category: 'FIC'
    };

    beforeEach(() => {
        localStorage.removeItem('btg_fondos_state');
        TestBed.configureTestingModule({});
        service = TestBed.inject(UserStateService);
        service.resetState();
    });

    afterEach(() => {
        localStorage.removeItem('btg_fondos_state');
    });

    it('debería iniciar con saldo de $500.000', () => {
        expect(service.balance()).toBe(500000);
    });

    it('debería iniciar sin suscripciones', () => {
        expect(service.subscriptions().length).toBe(0);
    });

    it('debería iniciar sin transacciones', () => {
        expect(service.transactions().length).toBe(0);
    });

    // ── Suscripciones ──

    it('debería suscribir exitosamente con monto válido', () => {
        const result = service.subscribe(mockFund, 75000, 'email', 'test@correo.com');
        expect(result.success).toBe(true);
        expect(service.balance()).toBe(425000);
        expect(service.subscriptions().length).toBe(1);
        expect(service.transactions().length).toBe(1);
    });

    it('debería rechazar monto menor al mínimo', () => {
        const result = service.subscribe(mockFund, 50000, 'email', 'test@correo.com');
        expect(result.success).toBe(false);
        expect(result.error).toContain('monto mínimo');
        expect(service.balance()).toBe(500000);
    });

    it('debería rechazar si no hay saldo suficiente', () => {
        service.subscribe(mockFund, 450000, 'email', 'test@correo.com');
        const expensive: Fund = { id: 4, name: 'FDO-ACCIONES', minimumAmount: 250000, category: 'FIC' };
        const result = service.subscribe(expensive, 250000, 'sms', '3001234567');
        expect(result.success).toBe(false);
        expect(result.error).toContain('saldo disponible');
    });

    it('debería rechazar suscripción duplicada', () => {
        service.subscribe(mockFund, 75000, 'email', 'test@correo.com');
        const result = service.subscribe(mockFund, 75000, 'email', 'test@correo.com');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Ya estás suscrito');
    });

    it('debería registrar método de notificación y destino', () => {
        service.subscribe(mockFund, 75000, 'sms', '3009876543');
        expect(service.subscriptions()[0].notificationMethod).toBe('sms');
        expect(service.subscriptions()[0].notificationDestination).toBe('3009876543');
        expect(service.transactions()[0].notificationMethod).toBe('sms');
        expect(service.transactions()[0].notificationDestination).toBe('3009876543');
    });

    it('debería permitir múltiples suscripciones', () => {
        service.subscribe(mockFund, 75000, 'email', 'a@correo.com');
        service.subscribe(mockFund2, 50000, 'sms', '3001112233');
        expect(service.subscriptions().length).toBe(2);
        expect(service.balance()).toBe(375000);
    });

    // ── Computed signals ──

    it('debería calcular totalInvested', () => {
        service.subscribe(mockFund, 100000, 'email', 'a@correo.com');
        service.subscribe(mockFund2, 50000, 'sms', '3001112233');
        expect(service.totalInvested()).toBe(150000);
    });

    it('debería calcular activeCount', () => {
        service.subscribe(mockFund, 75000, 'email', 'test@correo.com');
        expect(service.activeCount()).toBe(1);
    });

    // ── Cancelaciones ──

    it('debería cancelar y devolver saldo', () => {
        service.subscribe(mockFund, 100000, 'email', 'test@correo.com');
        const result = service.cancelSubscription(1);
        expect(result.success).toBe(true);
        expect(service.balance()).toBe(500000);
        expect(service.subscriptions().length).toBe(0);
        expect(service.transactions().length).toBe(2);
    });

    it('debería rechazar cancelación de fondo no suscrito', () => {
        const result = service.cancelSubscription(999);
        expect(result.success).toBe(false);
    });

    // ── Persistencia ──

    it('debería persistir estado en localStorage', () => {
        service.subscribe(mockFund, 75000, 'email', 'test@correo.com');
        const stored = localStorage.getItem('btg_fondos_state');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.balance).toBe(425000);
        expect(parsed.subscriptions.length).toBe(1);
    });

    it('debería limpiar localStorage al resetear', () => {
        service.subscribe(mockFund, 75000, 'email', 'test@correo.com');
        service.resetState();
        expect(service.balance()).toBe(500000);
        expect(localStorage.getItem('btg_fondos_state')).toBeNull();
    });

    // ── isSubscribed ──

    it('debería retornar true si está suscrito', () => {
        service.subscribe(mockFund, 75000, 'email', 'test@correo.com');
        expect(service.isSubscribed(1)).toBe(true);
    });

    it('debería retornar false si no está suscrito', () => {
        expect(service.isSubscribed(1)).toBe(false);
    });
});