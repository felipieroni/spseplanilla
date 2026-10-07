'use client';

import React, { useState, useEffect } from 'react';
import HistorialPlanillas, { RegistroHistorial } from '@/components/historial';
import { useOperador } from '@/context/operador-context';

export default function HistorialPage() {
  const { esGestorGeneral } = useOperador();
  const [historial, setHistorial] = useState<RegistroHistorial[]>([]);

  // CARGAR REGISTROS DESDE LOCALSTORAGE
  const cargarHistorial = () => {
    const raw = localStorage.getItem('historial_planillas');
    if (raw) {
      try {
        setHistorial(JSON.parse(raw));
      } catch (e) {
        console.error("Error al cargar historial:", e);
      }
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // OCULTAR PLANILLA Y ENVIAR A DATOS BORRADOS (SOFT DELETE)
  const handleEliminar = (id: string) => {
    if (!esGestorGeneral) return;

    const registro = historial.find((r) => r.id === id);
    if (!registro) return;

    const confirmar = window.confirm(
      `¿Deseas mover la planilla del ${registro.fecha} a Datos Borrados?`
    );
    if (!confirmar) return;

    // Se marca 'eliminado: true' en el array general de localStorage
    const nuevoHistorial = historial.map((item) =>
      item.id === id ? { ...item, eliminado: true } : item
    );

    setHistorial(nuevoHistorial);
    localStorage.setItem('historial_planillas', JSON.stringify(nuevoHistorial));
  };

  return (
    <HistorialPlanillas
      historial={historial}
      onEliminar={handleEliminar}
    />
  );
}