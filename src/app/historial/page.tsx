'use client';

import React, { useEffect, useState } from 'react';
import HistorialPlanillas, { RegistroHistorial } from '@/components/historial';

export default function HistorialPage() {
  const [historial, setHistorial] = useState<RegistroHistorial[]>([]);

  useEffect(() => {
    const datosGuardados = localStorage.getItem('historial_planillas');
    if (datosGuardados) {
      try {
        setHistorial(JSON.parse(datosGuardados));
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      }
    }
  }, []);

  const handleEliminar = (id: string) => {
    const registro = historial.find((r) => r.id === id);
    if (!registro) return;

    const confirmar = window.confirm(
      `🗑️ ¿Estás seguro/a de que deseas borrar este registro?\n\nFecha: ${registro.fecha}\nTurno: ${registro.turno}\nOperador: ${registro.operador}`
    );

    if (!confirmar) return;

    const nuevoHistorial = historial.filter((item) => item.id !== id);
    setHistorial(nuevoHistorial);
    localStorage.setItem('historial_planillas', JSON.stringify(nuevoHistorial));
  };

  return (
    <div className="container mx-auto">
      <HistorialPlanillas historial={historial} onEliminar={handleEliminar} />
    </div>
  );
}