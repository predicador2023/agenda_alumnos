// js/api.js
import { SB_URL, HEADERS } from './config.js';

/**
 * Obtiene todos los ingresos de la tabla.
 * Corresponde a tu fetch original de cargarDatos().
 */
export async function obtenerTodosLosIngresos() {
    try {
        const res = await fetch(`${SB_URL}/rest/v1/ingresos?select=*&order=fecha.desc`, { headers: HEADERS });
        if (!res.ok) throw new Error("Error en la respuesta de Supabase");
        return await res.json();
    } catch (err) {
        console.error("Error cargando datos:", err);
        return [];
    }
}

/**
 * Guarda o actualiza un registro.
 * Corresponde a tu lógica de 'onsubmit'.
 */
export async function guardarIngreso(datos, id = null) {
    const url = `${SB_URL}/rest/v1/ingresos${id ? `?id=eq.${id}` : ''}`;
    const method = id ? 'PATCH' : 'POST';
    
    try {
        const res = await fetch(url, { 
            method: method, 
            headers: HEADERS, 
            body: JSON.stringify([datos])
        });
        return res.ok;
    } catch (err) {
        console.error("Error al guardar:", err);
        return false;
    }
}

/**
 * Borra un registro por ID.
 * Corresponde a tu función borrarRegistro().
 */
export async function eliminarIngreso(id) {
    try {
        const res = await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, { 
            method: 'DELETE', 
            headers: HEADERS 
        });
        return res.ok;
    } catch (err) {
        console.error("Error al eliminar:", err);
        return false;
    }
}