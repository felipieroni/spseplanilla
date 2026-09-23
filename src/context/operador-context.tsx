'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const MAPA_TURNOS: Record<string, string[]> = {
  '00:00 a 06:00': ['00', '02', '04'],
  '06:00 a 12:00': ['06', '08', '10'],
  '12:00 a 18:00': ['12', '14', '16'],
  '18:00 a 00:00': ['18', '20', '22'],
};

interface OperadorContextType {
  turnoActivo: string;
  setTurnoActivo: (turno: string) => void;
  operadoresTurnos: Record<string, string>;
  setOperadoresTurnos: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  operadorActual: string;
  horaActualSistema: string;
  abrirModalOperador: (turno?: string) => void;
}

const OperadorContext = createContext<OperadorContextType | undefined>(undefined);

export function OperadorProvider({ children }: { children: ReactNode }) {
  const [turnoActivo, setTurnoActivo] = useState('06:00 a 12:00');
  const [operadoresTurnos, setOperadoresTurnos] = useState<Record<string, string>>({
    '06:00 a 12:00': 'BENICIO FILOSA',
  });
  const [horaActualSistema, setHoraActualSistema] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoSeleccionadoTemp, setTurnoSeleccionadoTemp] = useState('');
  const [nombreOperadorInput, setNombreOperadorInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const borradorTurno = localStorage.getItem('borrador_turno_activo');
    if (borradorTurno) setTurnoActivo(borradorTurno);
    const borradorOperadores = localStorage.getItem('borrador_operadores');
    if (borradorOperadores) {
      try { setOperadoresTurnos(JSON.parse(borradorOperadores)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('borrador_turno_activo', turnoActivo);
  }, [turnoActivo, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('borrador_operadores', JSON.stringify(operadoresTurnos));
  }, [operadoresTurnos, isMounted]);

  useEffect(() => {
    const tick = () => {
      const ahora = new Date();
      setHoraActualSistema(
        String(ahora.getHours()).padStart(2, '0') + ':' +
        String(ahora.getMinutes()).padStart(2, '0') + ':' +
        String(ahora.getSeconds()).padStart(2, '0')
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const abrirModalOperador = (turno?: string) => {
    const t = turno || turnoActivo;
    setTurnoSeleccionadoTemp(t);
    setNombreOperadorInput(operadoresTurnos[t] || '');
    setModalAbierto(true);
  };

  const guardarOperador = () => {
    if (!nombreOperadorInput.trim()) return;
    setOperadoresTurnos(prev => ({
      ...prev,
      [turnoSeleccionadoTemp]: nombreOperadorInput.trim().toUpperCase(),
    }));
    setTurnoActivo(turnoSeleccionadoTemp);
    setModalAbierto(false);
  };

  return (
    <OperadorContext.Provider value={{
      turnoActivo,
      setTurnoActivo,
      operadoresTurnos,
      setOperadoresTurnos,
      operadorActual: operadoresTurnos[turnoActivo] || 'SIN REGISTRAR',
      horaActualSistema,
      abrirModalOperador,
    }}>
      {children}

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800">
              Registro de Operador
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <p className="text-xs text-slate-600">
              Ingrese el nombre del operador para el turno{' '}
              <span className="font-bold text-blue-900">{turnoSeleccionadoTemp}</span>:
            </p>
            <input
              type="text"
              placeholder="Nombre y Apellido del Operador"
              value={nombreOperadorInput}
              onChange={e => setNombreOperadorInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && guardarOperador()}
              className="text-xs border p-2 rounded outline-none w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              onClick={guardarOperador}
              disabled={!nombreOperadorInput.trim()}
              className="bg-blue-700 hover:bg-blue-800 text-xs text-white"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OperadorContext.Provider>
  );
}

export function useOperador() {
  const context = useContext(OperadorContext);
  if (!context) throw new Error('useOperador debe usarse dentro de OperadorProvider');
  return context;
}