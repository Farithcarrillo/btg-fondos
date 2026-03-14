import { Injectable, signal } from '@angular/core';
import { Fund } from '@core/models';

/**
 * Servicio de datos de fondos.
 * Principio SRP: Solo provee datos de fondos disponibles.
 * Principio OCP: Reemplazable por HTTP real sin cambiar consumidores.
 *
 * En Angular 21 usamos signals nativos en los servicios.
 */
@Injectable({
    providedIn: 'root'
})
export class FundService {

    /** Datos mock según requisitos del negocio */
    private readonly fundsData: Fund[] = [
        { id: 1, name: 'FPV_BTG_PACTUAL_RECAUDADORA', minimumAmount: 75000, category: 'FPV' },
        { id: 2, name: 'FPV_BTG_PACTUAL_ECOPETROL', minimumAmount: 125000, category: 'FPV' },
        { id: 3, name: 'DEUDAPRIVADA', minimumAmount: 50000, category: 'FIC' },
        { id: 4, name: 'FDO-ACCIONES', minimumAmount: 250000, category: 'FIC' },
        { id: 5, name: 'FPV_BTG_PACTUAL_DINAMICA', minimumAmount: 100000, category: 'FPV' }
    ];

    /**
     * Carga los fondos simulando latencia de red.
     * Diseñado para ser usado con resource() en componentes.
     */
    async loadFunds(): Promise<Fund[]> {
        await this.simulateDelay(600);
        return [...this.fundsData];
    }

    /** Obtiene un fondo por ID */
    getFundById(id: number): Fund | undefined {
        return this.fundsData.find(f => f.id === id);
    }

    /** Simula latencia de red */
    private simulateDelay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}