'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOperador } from '@/context/operador-context';

const HORARIOS = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];

const MAPA_TURNOS: Record<string, string[]> = {
  '00:00 a 06:00': ['00', '02', '04'],
  '06:00 a 12:00': ['06', '08', '10'],
  '12:00 a 18:00': ['12', '14', '16'],
  '18:00 a 00:00': ['18', '20', '22'],
};

// ESTRUCTURA EN MÓDULOS A Y B:
const FILTROS_MODULO_A = [
  { key: 'MA_F1', label: 'F1' },
  { key: 'MA_F2', label: 'F2' },
  { key: 'MA_F3', label: 'F3' },
  { key: 'MA_F4', label: 'F4' },
];

const FILTROS_MODULO_B = [
  { key: 'MB_F1', label: 'F1' },
  { key: 'MB_F2', label: 'F2' },
  { key: 'MB_F3', label: 'F3' },
  { key: 'MB_F4', label: 'F4' },
];

const ALL_FILTROS = [...FILTROS_MODULO_A, ...FILTROS_MODULO_B];

const PURGAS_MODULO_A = [
  { key: 'MA_S1', label: 'S1' },
  { key: 'MA_S2', label: 'S2' },
];

const PURGAS_MODULO_B = [
  { key: 'MB_S1', label: 'S1' },
  { key: 'MB_S2', label: 'S2' },
];

const ALL_PURGAS = [...PURGAS_MODULO_A, ...PURGAS_MODULO_B];

const PAC10_PV = 1.26;
const SODA_PV = 0.05;

const parseNumber = (val: string | number | undefined): number => {
  if (val === undefined || val === null || val === '') return 0;
  const str = val.toString().trim().replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

interface RegistroHistorial {
  id: string;
  fecha: string;
  turno: string;
  operador: string;
  observaciones: string;
  descargado?: boolean;
  parametros?: Record<string, Record<string, string>>;
  filtrosEstado?: Record<string, Record<string, string>>;
  purgasEstado?: Record<string, Record<string, string>>;
  bombasEstado?: Record<string, Record<string, string>>;
}

export default function PlanillaUnificada24H() {
  const [isMounted, setIsMounted] = useState(false);
  const [fecha, setFecha] = useState('');
  const [horaActualSistema, setHoraActualSistema] = useState('');

  // OPERADOR GLOBAL
  const { operadorActual } = useOperador();

  // ESTADO DE TURNO
  const [turnoActivo, setTurnoActivo] = useState('06:00 a 12:00');
  
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);

  // Estados de la planilla
  const [parametros, setParametros] = useState<Record<string, Record<string, string>>>({});
  const [filtrosEstado, setFiltrosEstado] = useState<Record<string, Record<string, string>>>({});
  const [purgasEstado, setPurgasEstado] = useState<Record<string, Record<string, string>>>({});
  const [bombasEstado, setBombasEstado] = useState<Record<string, Record<string, string>>>({});
  const [observacionesGenerales, setObservacionesGenerales] = useState('');

  // Historial
  const [filtroFechaHistorial, setFiltroFechaHistorial] = useState('');
  const [historial, setHistorial] = useState<RegistroHistorial[]>([]);

  // CARGA INICIAL DE LOCALSTORAGE AL MONTAR
  useEffect(() => {
    setIsMounted(true);

    const borradorTurno = localStorage.getItem('borrador_turno_activo');
    if (borradorTurno) setTurnoActivo(borradorTurno);

    const borradorParametros = localStorage.getItem('borrador_parametros');
    if (borradorParametros) setParametros(JSON.parse(borradorParametros));

    const borradorFiltros = localStorage.getItem('borrador_filtros');
    if (borradorFiltros) setFiltrosEstado(JSON.parse(borradorFiltros));

    const borradorPurgas = localStorage.getItem('borrador_purgas');
    if (borradorPurgas) setPurgasEstado(JSON.parse(borradorPurgas));

    const borradorBombas = localStorage.getItem('borrador_bombas');
    if (borradorBombas) setBombasEstado(JSON.parse(borradorBombas));

    const borradorObs = localStorage.getItem('borrador_observaciones');
    if (borradorObs) setObservacionesGenerales(borradorObs);

    const datosGuardados = localStorage.getItem('historial_planillas');
    if (datosGuardados) {
      try {
        setHistorial(JSON.parse(datosGuardados));
      } catch (e) {
        console.error("Error al parsear el historial de localStorage", e);
      }
    }
  }, []);

  // Guardado automático del borrador en tiempo real
  useEffect(() => {
    if (isMounted) localStorage.setItem('borrador_turno_activo', turnoActivo);
  }, [turnoActivo, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('borrador_parametros', JSON.stringify(parametros));
  }, [parametros, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('borrador_filtros', JSON.stringify(filtrosEstado));
  }, [filtrosEstado, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('borrador_purgas', JSON.stringify(purgasEstado));
  }, [purgasEstado, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('borrador_bombas', JSON.stringify(bombasEstado));
  }, [bombasEstado, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('borrador_observaciones', observacionesGenerales);
  }, [observacionesGenerales, isMounted]);

  // Reloj
  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      const hs = String(ahora.getHours()).padStart(2, '0');
      const mins = String(ahora.getMinutes()).padStart(2, '0');
      const segs = String(ahora.getSeconds()).padStart(2, '0');
      setHoraActualSistema(`${hs}:${mins}:${segs}`);

      if (!fecha) {
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        setFecha(`${año}-${mes}-${dia}`);
      }
    };

    actualizarReloj();
    const interval = setInterval(actualizarReloj, 1000);
    return () => clearInterval(interval);
  }, [fecha]);

  // ALGORITMO PRECISO: OBTENER FILTRO(S) CON MÁS TIEMPO SIN LAVAR POR HORAS Y MÓDULO INDEPENDIENTE
  const obtenerFiltrosRecomendadosPorModulo = (listaFiltros: typeof FILTROS_MODULO_A) => {
    const ultimoPasoLavado: Record<string, number> = {};

    listaFiltros.forEach((f) => {
      ultimoPasoLavado[f.key] = -Infinity;
    });

    // 1. Revisar la planilla activa en tiempo real
    Object.entries(filtrosEstado || {}).forEach(([hs, hsData]) => {
      if (!hsData) return;
      const hIndex = HORARIOS.indexOf(hs);
      if (hIndex === -1) return;

      listaFiltros.forEach((f) => {
        if (hsData[f.key] === 'L') {
          if (hIndex > ultimoPasoLavado[f.key]) {
            ultimoPasoLavado[f.key] = hIndex;
          }
        }
      });
    });

    // 2. Revisar el historial guardado
    historial.forEach((registro, idx) => {
      if (!registro.filtrosEstado) return;
      
      const offsetRegistro = -(idx + 1) * HORARIOS.length;

      Object.entries(registro.filtrosEstado).forEach(([hs, hsData]) => {
        if (!hsData) return;
        const hIndex = HORARIOS.indexOf(hs);
        if (hIndex === -1) return;

        const pasoGlobal = offsetRegistro + hIndex;

        listaFiltros.forEach((f) => {
          if (hsData[f.key] === 'L') {
            if (pasoGlobal > ultimoPasoLavado[f.key]) {
              ultimoPasoLavado[f.key] = pasoGlobal;
            }
          }
        });
      });
    });

    // 3. Buscar el valor MÍNIMO de paso de lavado
    let minPaso = Infinity;
    listaFiltros.forEach((f) => {
      if (ultimoPasoLavado[f.key] < minPaso) {
        minPaso = ultimoPasoLavado[f.key];
      }
    });

    const recomendados = listaFiltros.filter((f) => ultimoPasoLavado[f.key] === minPaso);

    if (recomendados.length === listaFiltros.length) {
      return listaFiltros.slice(0, 1);
    }

    return recomendados;
  };

  const recomendadosModuloA = obtenerFiltrosRecomendadosPorModulo(FILTROS_MODULO_A);
  const recomendadosModuloB = obtenerFiltrosRecomendadosPorModulo(FILTROS_MODULO_B);
  const filtrosRecomendados = [...recomendadosModuloA, ...recomendadosModuloB];

  // NAVEGACIÓN CON ENTER HACIA LA DERECHA
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputs = Array.from(
        document.querySelectorAll<HTMLInputElement>('table input:not([disabled])')
      );
      const index = inputs.indexOf(e.currentTarget);
      if (index !== -1 && index + 1 < inputs.length) {
        inputs[index + 1].focus();
        inputs[index + 1].select();
      }
    }
  };

  // GUARDAR PLANILLA Y REGISTRAR EN HISTORIAL
  const guardarPlanillaYRegistrar = () => {
    const nuevoRegistro: RegistroHistorial = {
      id: Date.now().toString(),
      fecha: fecha || new Date().toISOString().split('T')[0],
      turno: turnoActivo,
      operador: operadorActual || 'SIN REGISTRAR',
      observaciones: observacionesGenerales || 'Sin observaciones registradas.',
      descargado: false,
      parametros: JSON.parse(JSON.stringify(parametros)),
      filtrosEstado: JSON.parse(JSON.stringify(filtrosEstado)),
      purgasEstado: JSON.parse(JSON.stringify(purgasEstado)),
      bombasEstado: JSON.parse(JSON.stringify(bombasEstado)),
    };

    const nuevoHistorial = [nuevoRegistro, ...historial];
    setHistorial(nuevoHistorial);
    localStorage.setItem('historial_planillas', JSON.stringify(nuevoHistorial));

    // Limpiar borrador local
    setParametros({});
    setFiltrosEstado({});
    setPurgasEstado({});
    setBombasEstado({});
    setObservacionesGenerales('');

    localStorage.removeItem('borrador_parametros');
    localStorage.removeItem('borrador_filtros');
    localStorage.removeItem('borrador_purgas');
    localStorage.removeItem('borrador_bombas');
    localStorage.removeItem('borrador_observaciones');

    alert('¡Planilla guardada exitosamente en el historial!');
  };

  // ELIMINAR REGISTRO INDIVIDUAL CON ADVERTENCIA DE DESCARGA
  const eliminarRegistroHistorial = (id: string) => {
    const registro = historial.find((r) => r.id === id);
    if (!registro) return;

    if (!registro.descargado) {
      const confirmarSinDescargar = window.confirm(
        `⚠️ ¡ATENCIÓN!\n\nEste registro (${registro.fecha} - ${registro.turno}) TODAVÍA NO HA SIDO DESCARGADO/GUARDADO externamente.\n\n¿Estás seguro/a de que deseas borrarlo definitivamente?`
      );
      if (!confirmarSinDescargar) return;
    } else {
      const confirmarBorrado = window.confirm(
        `¿Confirmas borrar el registro del ${registro.fecha} - ${registro.turno}?`
      );
      if (!confirmarBorrado) return;
    }

    const nuevoHistorial = historial.filter((r) => r.id !== id);
    setHistorial(nuevoHistorial);
    localStorage.setItem('historial_planillas', JSON.stringify(nuevoHistorial));
  };

  // SIMULAR/REALIZAR DESCARGA DE REGISTRO
  const descargarRegistro = (reg: RegistroHistorial) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reg, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `planilla_${reg.fecha}_${reg.turno.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // Marcar como descargado
    const nuevoHistorial = historial.map((r) => {
      if (r.id === reg.id) return { ...r, descargado: true };
      return r;
    });
    setHistorial(nuevoHistorial);
    localStorage.setItem('historial_planillas', JSON.stringify(nuevoHistorial));
  };

  const handleInputChange = (hs: string, campo: string, valor: string) => {
    setParametros((prev) => {
      const horaActual = { ...(prev[hs] || {}) };
      horaActual[campo] = valor;

      const Qp = parseNumber(horaActual.caudal);

      if (campo === 'caudal') {
        if (Qp > 0) {
          const pacPpmVal = parseNumber(horaActual.pacPpm);
          if (pacPpmVal > 0) {
            horaActual.pacMlMin = Math.round((pacPpmVal * Qp) / (60 * PAC10_PV)).toString();
          }

          const sodaPpmVal = parseNumber(horaActual.sodaPpm);
          if (sodaPpmVal > 0) {
            horaActual.sodaMlMin = Math.round((sodaPpmVal * Qp) / (60 * SODA_PV)).toString();
          }
        }
      }

      if (campo === 'pacPpm') {
        const ppm = parseNumber(valor);
        if (ppm > 0 && Qp > 0) {
          horaActual.pacMlMin = Math.round((ppm * Qp) / (60 * PAC10_PV)).toString();
        }
      } else if (campo === 'pacMlMin') {
        const ml = parseNumber(valor);
        if (ml > 0 && Qp > 0) {
          horaActual.pacPpm = ((ml * PAC10_PV * 60) / Qp).toFixed(1);
        }
      }

      if (campo === 'sodaPpm') {
        const ppm = parseNumber(valor);
        if (ppm > 0 && Qp > 0) {
          horaActual.sodaMlMin = Math.round((ppm * Qp) / (60 * SODA_PV)).toString();
        }
      } else if (campo === 'sodaMlMin') {
        const ml = parseNumber(valor);
        if (ml > 0 && Qp > 0) {
          horaActual.sodaPpm = ((ml * SODA_PV * 60) / Qp).toFixed(1);
        }
      }

      return {
        ...prev,
        [hs]: horaActual,
      };
    });
  };

  const setEstadoFiltro = (hs: string, filtroKey: string, valor: string) => {
    setFiltrosEstado((prev) => ({
      ...prev,
      [hs]: {
        ...(prev[hs] || {}),
        [filtroKey]: valor,
      },
    }));
  };

  const setEstadoPurga = (hs: string, sedKey: string, valor: string) => {
    setPurgasEstado((prev) => ({
      ...prev,
      [hs]: {
        ...(prev[hs] || {}),
        [sedKey]: valor,
      },
    }));
  };

  const setEstadoBomba = (hs: string, bombaKey: string, valor: string) => {
    setBombasEstado((prev) => ({
      ...prev,
      [hs]: {
        ...(prev[hs] || {}),
        [bombaKey]: valor,
      },
    }));
  };

  if (!isMounted) return null;

  const horasTurnoActual = MAPA_TURNOS[turnoActivo] || [];

  const historialFiltrado = filtroFechaHistorial 
    ? historial.filter(h => h.fecha === filtroFechaHistorial)
    : historial;

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col text-xs overflow-y-auto">

      {/* MODAL HISTORIAL DE REGISTROS */}
      <Dialog open={modalHistorialAbierto} onOpenChange={setModalHistorialAbierto}>
        <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              Historial de Planillas Registradas
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-between items-center bg-slate-50 p-2 rounded border gap-2 my-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Filtrar por fecha:</span>
              <input
                type="date"
                value={filtroFechaHistorial}
                onChange={(e) => setFiltroFechaHistorial(e.target.value)}
                className="h-7 w-36 text-xs bg-white border rounded px-1"
              />
              {filtroFechaHistorial && (
                <Button 
                  variant="ghost" 
                  onClick={() => setFiltroFechaHistorial('')}
                  className="h-7 text-xs text-slate-500 hover:text-slate-800"
                >
                  Limpiar
                </Button>
              )}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Mostrando {historialFiltrado.length} registros
            </span>
          </div>

          <div className="overflow-x-auto overflow-y-auto flex-1 border rounded my-2">
            <table className="w-full min-w-[750px] text-left text-xs border-collapse">
              <thead className="bg-slate-100 sticky top-0 border-b font-bold text-slate-700 z-10">
                <tr>
                  <th className="p-2 border-r">Fecha</th>
                  <th className="p-2 border-r">Turno</th>
                  <th className="p-2 border-r">Operador</th>
                  <th className="p-2 border-r text-center">Lavados</th>
                  <th className="p-2 border-r text-center">Purgas</th>
                  <th className="p-2 border-r text-center">Estado Guardado</th>
                  <th className="p-2 border-r">Observaciones</th>
                  <th className="p-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historialFiltrado.length > 0 ? (
                  historialFiltrado.map((reg) => {
                    const cantLavados = reg.filtrosEstado 
                      ? Object.values(reg.filtrosEstado).reduce((acc, hs) => acc + Object.values(hs).filter(v => v === 'L' || v === '1').length, 0)
                      : 0;
                    const cantPurgas = reg.purgasEstado 
                      ? Object.values(reg.purgasEstado).reduce((acc, hs) => acc + Object.values(hs).filter(v => v === 'P' || v === '1').length, 0)
                      : 0;

                    return (
                      <tr key={reg.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-2 font-mono font-semibold text-slate-800 border-r">{reg.fecha}</td>
                        <td className="p-2 border-r font-medium text-slate-700">{reg.turno}</td>
                        <td className="p-2 border-r font-bold text-slate-900">{reg.operador}</td>
                        <td className="p-2 border-r text-center font-bold text-cyan-700">{cantLavados}</td>
                        <td className="p-2 border-r text-center font-bold text-amber-800">{cantPurgas}</td>
                        <td className="p-2 border-r text-center font-bold">
                          {reg.descargado ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Descargado
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              ⚠️ Pendiente
                            </span>
                          )}
                        </td>
                        <td className="p-2 border-r text-slate-600 truncate max-w-[150px]">{reg.observaciones}</td>
                        <td className="p-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => descargarRegistro(reg)}
                              className="h-7 px-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-none"
                            >
                              Descargar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => eliminarRegistroHistorial(reg.id)}
                              className="h-7 px-2.5 font-bold text-xs shadow-none"
                            >
                              🗑️ Borrar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-slate-400 italic">
                      No hay registros guardados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalHistorialAbierto(false)} className="text-xs">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONTENIDO PRINCIPAL */}
      <div className="p-2 flex flex-col gap-2">
        {/* SUB-HEADER CON OPCIONES DE TURNO CENTRADAS */}
        <div className="flex flex-wrap justify-between items-center bg-white p-2 rounded shadow-sm border gap-2">
          <h1 className="font-bold text-sm text-slate-800 shrink-0">
            Planilla Control Planta Potabilizadora SPSE
          </h1>
          
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border">
              <span className="text-xs font-semibold text-slate-500 px-1">Turno:</span>
              {Object.keys(MAPA_TURNOS).map((t) => (
                <button
                  key={t}
                  onClick={() => setTurnoActivo(t)}
                  className={`px-2 py-0.5 text-xs font-bold rounded transition-all ${
                    turnoActivo === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <label className="font-semibold text-slate-600 text-xs">Fecha:</label>
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
              className="h-7 w-36 text-xs bg-white border rounded px-2" 
            />
          </div>
        </div>

        {/* TABLA DE PARÁMETROS COMPLETA */}
        <div className="bg-white border rounded shadow-sm p-2 flex flex-col gap-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-slate-600 text-center text-xs">
              <thead>
                <tr className="bg-slate-300 font-bold border-b-2 border-slate-600">
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1 w-8" rowSpan={2}>HS</th>
                  <th className="border border-slate-400 p-1" colSpan={4}>EBAC</th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1 w-16" rowSpan={2}>NIVEL POZO<br/><span className="text-[9px] font-normal">(m)</span></th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1" colSpan={3}>AGUA CRUDA</th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1" colSpan={2}>DOSIFICACIÓN PAC 10</th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1" colSpan={2}>DOSIFICACIÓN SODA</th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1" colSpan={2}>AGUA CAF</th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1" rowSpan={2}>CLORO<br/><span className="text-[10px] font-normal">(p.p.m.)</span></th>
                  <th className="border border-slate-400 p-1" colSpan={4}>EBAP</th>
                </tr>

                <tr className="bg-slate-100 font-bold border-b-2 border-slate-600 text-[11px]">
                  <th className="border border-slate-400 p-1 w-7">B1</th>
                  <th className="border border-slate-400 p-1 w-7">B2</th>
                  <th className="border border-slate-400 p-1 w-7">B3</th>
                  <th className="border border-slate-400 p-1 w-7">B4</th>

                  <th className="border border-slate-400 p-1">CAUDAL<br/><span className="text-[9px] font-normal">(m³/h)</span></th>
                  <th className="border border-slate-400 p-1">TURB.<br/><span className="text-[9px] font-normal">(NTU)</span></th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1">pH</th>

                  <th className="border border-slate-400 p-1">DOSIF.<br/><span className="text-[9px] font-normal">(ml/min)</span></th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1 bg-blue-50">DETERM.<br/><span className="text-[9px] font-bold text-blue-800">(p.p.m.)</span></th>

                  <th className="border border-slate-400 p-1">DOSIF.<br/><span className="text-[9px] font-normal">(ml/min)</span></th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1 bg-emerald-50">DETERM.<br/><span className="text-[9px] font-bold text-emerald-800">(p.p.m.)</span></th>

                  <th className="border border-slate-400 p-1">TURB.<br/><span className="text-[9px] font-normal">(NTU)</span></th>
                  <th className="border border-slate-400 border-r-2 border-r-slate-700 p-1">pH</th>

                  <th className="border border-slate-400 p-1 w-7">B1</th>
                  <th className="border border-slate-400 p-1 w-7">B2</th>
                  <th className="border border-slate-400 p-1 w-7">B3</th>
                  <th className="border border-slate-400 p-1 w-7">B4</th>
                </tr>
              </thead>
              <tbody>
                {HORARIOS.map((hs) => {
                  const esDelTurnoActual = horasTurnoActual.includes(hs);
                  const datosHs = parametros[hs] || {};
                  const bombasHs = bombasEstado[hs] || {};

                  return (
                    <tr 
                      key={hs} 
                      className={`transition-colors ${
                        esDelTurnoActual ? 'bg-amber-50/90 font-semibold' : 'bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <td className={`border border-slate-400 border-r-2 border-r-slate-700 p-0 font-bold ${
                        esDelTurnoActual ? 'bg-amber-200 text-blue-950' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {hs}
                      </td>

                      {['ebac_b1', 'ebac_b2', 'ebac_b3', 'ebac_b4'].map((bKey) => {
                        const val = bombasHs[bKey] || '';
                        return (
                          <td 
                            key={bKey} 
                            className={`border border-slate-400 p-0 transition-colors ${
                              val === 'M' ? 'bg-emerald-200 font-bold text-emerald-950' : val === 'P' ? 'bg-rose-200 font-bold text-rose-950' : val === '/' ? 'bg-slate-300 text-slate-800 font-bold' : ''
                            }`}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild disabled={!esDelTurnoActual}>
                                <button className="w-full h-7 text-center font-bold outline-none flex items-center justify-center disabled:cursor-not-allowed">
                                  {val || '-'}
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center" className="min-w-[6rem] p-1">
                                <DropdownMenuItem onClick={() => setEstadoBomba(hs, bKey, 'M')} className="text-xs font-bold bg-emerald-100 py-1.5 cursor-pointer">
                                  M (Marcha)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEstadoBomba(hs, bKey, 'P')} className="text-xs font-bold bg-rose-100 py-1.5 cursor-pointer">
                                  P (Parada)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEstadoBomba(hs, bKey, '/')} className="text-xs font-bold bg-slate-200 py-1.5 cursor-pointer">
                                  / (Fuera de Servicio)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEstadoBomba(hs, bKey, '')} className="text-xs text-slate-400 py-1 cursor-pointer">
                                  Limpiar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        );
                      })}

                      <td className="border border-slate-400 border-r-2 border-r-slate-700 p-0">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.nivelPozo ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'nivelPozo', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>
                      
                      <td className="border border-slate-400 p-0">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.caudal ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'caudal', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs p-0 border-none outline-none bg-transparent font-bold disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>
                      <td className="border border-slate-400 p-0">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.turbCruda ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'turbCruda', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>
                      <td className="border border-slate-400 border-r-2 border-r-slate-700 p-0">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.phCruda ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'phCruda', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>
                      
                      <td className="border border-slate-400 p-0">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.pacMlMin ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'pacMlMin', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>
                      <td className="border border-slate-400 border-r-2 border-r-slate-700 p-0 bg-blue-50/50">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.pacPpm ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'pacPpm', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs font-bold text-blue-900 p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>

                      <td className="border border-slate-400 p-0">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.sodaMlMin ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'sodaMlMin', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>
                      <td className="border border-slate-400 border-r-2 border-r-slate-700 p-0 bg-emerald-50/50">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.sodaPpm ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'sodaPpm', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs font-bold text-emerald-900 p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>
                      
                      <td className="border border-slate-400 p-0">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.turbCaf ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'turbCaf', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>
                      <td className="border border-slate-400 border-r-2 border-r-slate-700 p-0">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.phCaf ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'phCaf', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>
                      
                      <td className="border border-slate-400 border-r-2 border-r-slate-700 p-0">
                        <input 
                          disabled={!esDelTurnoActual}
                          type="text"
                          autoComplete="off"
                          value={datosHs.cloro ?? ''} 
                          onChange={(e) => handleInputChange(hs, 'cloro', e.target.value)} 
                          onKeyDown={handleKeyDown}
                          className="h-7 w-full text-center text-xs p-0 border-none outline-none bg-transparent disabled:bg-slate-100/50" 
                          placeholder="0" 
                        />
                      </td>

                      {['ebap_b1', 'ebap_b2', 'ebap_b3', 'ebap_b4'].map((bKey) => {
                        const val = bombasHs[bKey] || '';
                        return (
                          <td 
                            key={bKey} 
                            className={`border border-slate-400 p-0 transition-colors ${
                              val === 'M' ? 'bg-emerald-200 font-bold text-emerald-950' : val === 'P' ? 'bg-rose-200 font-bold text-rose-950' : val === '/' ? 'bg-slate-300 text-slate-800 font-bold' : ''
                            }`}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild disabled={!esDelTurnoActual}>
                                <button className="w-full h-7 text-center font-bold outline-none flex items-center justify-center disabled:cursor-not-allowed">
                                  {val || '-'}
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center" className="min-w-[6rem] p-1">
                                <DropdownMenuItem onClick={() => setEstadoBomba(hs, bKey, 'M')} className="text-xs font-bold bg-emerald-100 py-1.5 cursor-pointer">
                                  M (Marcha)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEstadoBomba(hs, bKey, 'P')} className="text-xs font-bold bg-rose-100 py-1.5 cursor-pointer">
                                  P (Parada)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEstadoBomba(hs, bKey, '/')} className="text-xs font-bold bg-slate-200 py-1.5 cursor-pointer">
                                  / (Fuera de Servicio)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEstadoBomba(hs, bKey, '')} className="text-xs text-slate-400 py-1 cursor-pointer">
                                  Limpiar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* LAVADO DE FILTROS, PURGAS Y OBSERVACIONES (DISTRIBUCIÓN GRID 100% ANCHO) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 border-t border-slate-300 pt-2 items-stretch w-full">
            
            {/* TABLA LAVADO DE FILTROS (MÓDULO A Y MÓDULO B) */}
            <div className="lg:col-span-5 overflow-x-auto w-full flex flex-col">
              <table className="border-collapse border border-slate-400 text-center text-xs w-full h-full table-fixed">
                <thead>
                  <tr className="bg-cyan-950 text-white font-black tracking-wider border-b border-slate-400">
                    <th className="border border-slate-400 p-1 text-xs uppercase" colSpan={9}>
                      ESTADO / LAVADO DE FILTROS
                    </th>
                  </tr>
                  <tr className="bg-cyan-900 text-white font-bold border-b border-slate-400 text-xs">
                    <th className="border border-slate-400 border-r-2 border-r-slate-700 p-0.5 w-8" rowSpan={2}>HS</th>
                    <th className="border border-slate-400 border-r-2 border-r-slate-700 p-0.5 bg-cyan-950/80" colSpan={4}>MÓDULO A</th>
                    <th className="border border-slate-400 p-0.5 bg-cyan-950/80" colSpan={4}>MÓDULO B</th>
                  </tr>
                  <tr className="bg-cyan-800 text-white font-bold border-b border-slate-400 text-xs">
                    {ALL_FILTROS.map((f) => {
                      const esRecomendado = filtrosRecomendados.some((rec) => rec.key === f.key);
                      return (
                        <th 
                          key={f.key} 
                          className={`border border-slate-400 p-0.5 ${f.key === 'MA_F4' ? 'border-r-2 border-r-slate-700' : ''}`}
                        >
                          <span className={esRecomendado ? 'text-red-500 font-black block' : ''}>
                            {f.label}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {HORARIOS.map((hs) => {
                    const esDelTurnoActual = horasTurnoActual.includes(hs);
                    const hsFiltros = filtrosEstado[hs] || {};

                    return (
                      <tr key={`lavado-${hs}`} className={esDelTurnoActual ? 'bg-amber-50/90 font-semibold' : 'bg-slate-50/50 opacity-60'}>
                        <td className={`border border-slate-400 border-r-2 border-r-slate-700 p-0 font-bold h-6 ${
                          esDelTurnoActual ? 'bg-amber-200 text-blue-950' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {hs}
                        </td>
                        {ALL_FILTROS.map((f) => {
                          const val = hsFiltros[f.key] || '';
                          const esUltimoModuloA = f.key === 'MA_F4';
                          return (
                            <td 
                              key={f.key} 
                              className={`border border-slate-400 p-0 h-6 ${esUltimoModuloA ? 'border-r-2 border-r-slate-700' : ''} ${
                                val === 'L' ? 'bg-red-400 text-black font-black' : val === 'M' ? 'bg-emerald-100 font-bold text-emerald-950' : val === '/' ? 'bg-slate-300 text-slate-800 font-bold' : ''
                              }`}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild disabled={!esDelTurnoActual}>
                                  <button className="w-full h-full text-center font-bold outline-none flex items-center justify-center disabled:cursor-not-allowed text-xs">
                                    {val || '-'}
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="min-w-[5rem] p-1">
                                  <DropdownMenuItem onClick={() => setEstadoFiltro(hs, f.key, 'L')} className="text-xs font-black bg-cyan-100 py-1.5 cursor-pointer">
                                    L (Lavado)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEstadoFiltro(hs, f.key, 'M')} className="text-xs font-bold py-1.5 cursor-pointer">
                                    M (Marcha)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEstadoFiltro(hs, f.key, '/')} className="text-xs font-bold bg-slate-200 py-1.5 cursor-pointer">
                                    / (Fuera de Servicio)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEstadoFiltro(hs, f.key, '')} className="text-xs text-slate-400 py-1 cursor-pointer">
                                    Limpiar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* TABLA PURGAS DE SEDIMENTADORES (MÓDULO A Y MÓDULO B) */}
            <div className="lg:col-span-3 overflow-x-auto w-full flex flex-col">
              <table className="border-collapse border border-slate-400 text-center text-xs w-full h-full">
                <thead>
                  <tr className="bg-amber-950 text-white font-black tracking-wider border-b border-slate-400">
                    <th className="border border-slate-400 p-1 text-xs uppercase" colSpan={5}>
                      PURGAS DE SEDIMENTADORES
                    </th>
                  </tr>
                  <tr className="bg-amber-900 text-white font-bold border-b border-slate-400 text-xs">
                    <th className="border border-slate-400 border-r-2 border-r-slate-700 p-0.5" rowSpan={2}>HS</th>
                    <th className="border border-slate-400 border-r-2 border-r-slate-700 p-0.5 bg-amber-950/80" colSpan={2}>MÓDULO A</th>
                    <th className="border border-slate-400 p-0.5 bg-amber-950/80" colSpan={2}>MÓDULO B</th>
                  </tr>
                  <tr className="bg-amber-800 text-white font-bold border-b border-slate-400 text-xs">
                    {ALL_PURGAS.map((s) => (
                      <th 
                        key={s.key} 
                        className={`border border-slate-400 p-0.5 ${s.key === 'MA_S2' ? 'border-r-2 border-r-slate-700' : ''}`}
                      >
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HORARIOS.map((hs) => {
                    const esDelTurnoActual = horasTurnoActual.includes(hs);
                    const hsPurgas = purgasEstado[hs] || {};

                    return (
                      <tr key={`purga-${hs}`} className={esDelTurnoActual ? 'bg-amber-50/90 font-semibold' : 'bg-slate-50/50 opacity-60'}>
                        <td className={`border border-slate-400 border-r-2 border-r-slate-700 p-0 font-bold h-6 ${
                          esDelTurnoActual ? 'bg-amber-200 text-blue-950' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {hs}
                        </td>
                        {ALL_PURGAS.map((s) => {
                          const val = hsPurgas[s.key] || '';
                          const esUltimoModuloA = s.key === 'MA_S2';
                          return (
                            <td 
                              key={s.key} 
                              className={`border border-slate-400 p-0 h-6 ${esUltimoModuloA ? 'border-r-2 border-r-slate-700' : ''} ${
                                val === 'P' ? 'bg-amber-300 font-extrabold text-amber-950' : val === '/' ? 'bg-slate-300 text-slate-800 font-bold' : ''
                              }`}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild disabled={!esDelTurnoActual}>
                                  <button className="w-full h-full text-center font-bold outline-none flex items-center justify-center disabled:cursor-not-allowed text-xs">
                                    {val || '-'}
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="min-w-[5rem] p-1">
                                  <DropdownMenuItem onClick={() => setEstadoPurga(hs, s.key, 'P')} className="text-xs font-black bg-amber-100 py-1.5 cursor-pointer">
                                    P (Purga)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEstadoPurga(hs, s.key, '/')} className="text-xs font-bold bg-slate-200 py-1.5 cursor-pointer">
                                    / (Fuera de Servicio)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEstadoPurga(hs, s.key, '')} className="text-xs text-slate-400 py-1 cursor-pointer">
                                    Limpiar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* OBSERVACIONES GENERALES */}
            <div className="lg:col-span-4 w-full flex flex-col border border-slate-400 rounded overflow-hidden">
              <div className="bg-slate-800 text-white font-bold p-1 text-xs text-center border-b border-slate-400 uppercase tracking-wide">
                OBSERVACIONES GENERALES
              </div>
              <textarea
                value={observacionesGenerales}
                onChange={(e) => setObservacionesGenerales(e.target.value)}
                placeholder="Escriba novedades del día, trabajos realizados, observaciones del turno..."
                className="w-full flex-1 p-2 text-xs resize-none border-none outline-none focus:ring-0 text-slate-800 bg-slate-50/50 leading-relaxed min-h-[160px]"
              />
            </div>

          </div>
        </div>

        {/* BOTÓN GUARDAR (2/3 ANCHO Y CENTRADO) */}
        <div className="w-full flex justify-center my-2">
          <Button 
            onClick={guardarPlanillaYRegistrar}
            className="w-2/3 h-11 text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all rounded-lg"
          >
            Guardar Planilla Completa
          </Button>
        </div>
      </div>

    </div>
  );
}