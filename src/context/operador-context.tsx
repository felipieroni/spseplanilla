'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, ShieldCheck, User } from 'lucide-react';

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
  esGestorGeneral: boolean;
  horaActualSistema: string;
  abrirModalOperador: (turno?: string) => void;
}

const OperadorContext = createContext<OperadorContextType | undefined>(undefined);

export function OperadorProvider({ children }: { children: ReactNode }) {
  const [turnoActivo, setTurnoActivo] = useState('06:00 a 12:00');
  
  // Estado inicial vacío para que en navegadores nuevos figure "SIN REGISTRAR" por defecto
  const [operadoresTurnos, setOperadoresTurnos] = useState<Record<string, string>>({});
  
  const [horaActualSistema, setHoraActualSistema] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoSeleccionadoTemp, setTurnoSeleccionadoTemp] = useState('');

  // 'OPERADOR' | 'GESTOR'
  const [tipoRol, setTipoRol] = useState<'OPERADOR' | 'GESTOR'>('OPERADOR');
  const [nombreOperadorInput, setNombreOperadorInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const borradorTurno = localStorage.getItem('borrador_turno_activo');
    if (borradorTurno) setTurnoActivo(borradorTurno);
    const borradorOperadores = localStorage.getItem('borrador_operadores');
    if (borradorOperadores) {
      try {
        setOperadoresTurnos(JSON.parse(borradorOperadores));
      } catch (e) {}
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
    const opActual = operadoresTurnos[t] || '';

    if (opActual.trim().toUpperCase() === 'GESTOR GENERAL') {
      setTipoRol('GESTOR');
      setNombreOperadorInput('');
    } else {
      setTipoRol('OPERADOR');
      setNombreOperadorInput(opActual);
    }

    setPasswordInput('');
    setErrorPassword('');
    setModalAbierto(true);
  };

  const guardarOperador = () => {
    setErrorPassword('');

    if (tipoRol === 'GESTOR') {
      if (passwordInput !== '1234') {
        setErrorPassword('Contraseña incorrecta para el Gestor General.');
        return;
      }
      setOperadoresTurnos((prev) => ({
        ...prev,
        [turnoSeleccionadoTemp]: 'GESTOR GENERAL',
      }));
    } else {
      const nombreLimpio = nombreOperadorInput.trim().toUpperCase();
      if (!nombreLimpio) return;
      setOperadoresTurnos((prev) => ({
        ...prev,
        [turnoSeleccionadoTemp]: nombreLimpio,
      }));
    }

    setTurnoActivo(turnoSeleccionadoTemp);
    setModalAbierto(false);
    setPasswordInput('');
    setErrorPassword('');
  };

  const operadorActual = operadoresTurnos[turnoActivo] || 'SIN REGISTRAR';
  const esGestorGeneral = operadorActual.trim().toUpperCase() === 'GESTOR GENERAL';

  return (
    <OperadorContext.Provider
      value={{
        turnoActivo,
        setTurnoActivo,
        operadoresTurnos,
        setOperadoresTurnos,
        operadorActual,
        esGestorGeneral,
        horaActualSistema,
        abrirModalOperador,
      }}
    >
      {children}

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Registro de Operador
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            {/* SELECCIÓN DE DOS OPCIONES */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTipoRol('OPERADOR');
                  setErrorPassword('');
                }}
                className={`p-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  tipoRol === 'OPERADOR'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" /> Operador General
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipoRol('GESTOR');
                  setErrorPassword('');
                }}
                className={`p-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  tipoRol === 'GESTOR'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Gestor General
              </button>
            </div>

            {/* OPCIÓN 1: OPERADOR GENERAL */}
            {tipoRol === 'OPERADOR' && (
              <div className="flex flex-col gap-1 mt-1">
                <label className="font-semibold text-slate-700 text-xs">Nombre del Operador:</label>
                <input
                  type="text"
                  placeholder="Ingrese nombre de Usuario"
                  value={nombreOperadorInput}
                  onChange={(e) => setNombreOperadorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && guardarOperador()}
                  className="text-xs border p-2 rounded outline-none w-full bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                  autoFocus
                />
              </div>
            )}

            {/* OPCIÓN 2: GESTOR GENERAL (SOLICITA CONTRASEÑA) */}
            {tipoRol === 'GESTOR' && (
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg flex flex-col gap-2 mt-1">
                <label className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-700" /> Contraseña de Gestor General:
                </label>
                <input
                  type="password"
                  placeholder="Ingrese la contraseña"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setErrorPassword('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && guardarOperador()}
                  className="text-xs border border-amber-300 p-2 rounded outline-none w-full bg-white font-mono"
                  autoFocus
                />
              </div>
            )}

            {errorPassword && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 p-2 rounded">
                ⚠️ {errorPassword}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModalAbierto(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarOperador}
              disabled={tipoRol === 'OPERADOR' ? !nombreOperadorInput.trim() : !passwordInput.trim()}
              className="bg-blue-700 hover:bg-blue-800 text-xs text-white h-8 font-bold gap-1"
            >
              {tipoRol === 'GESTOR' && <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />}
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