'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';

export interface RegistroHistorial {
  id: string;
  fecha: string;
  turno: string;
  operador: string;
  observaciones: string;
  ultimaModificacion?: string;
  parametros?: Record<string, Record<string, string>>;
  filtrosEstado?: Record<string, Record<string, string>>;
  purgasEstado?: Record<string, Record<string, string>>;
  bombasEstado?: Record<string, Record<string, string>>;
}

const HORARIOS_IMPARES = ['01', '03', '05', '07', '09', '11', '13', '15', '17', '19', '21', '23'];
const HORARIOS_PARES   = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];

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

const PURGAS_MODULO_A = [
  { key: 'MA_S1', label: 'S1' },
  { key: 'MA_S2', label: 'S2' },
];

const PURGAS_MODULO_B = [
  { key: 'MB_S1', label: 'S1' },
  { key: 'MB_S2', label: 'S2' },
];

interface Props {
  historial?: RegistroHistorial[];
  onEliminar?: (id: string) => void;
}

export default function HistorialPlanillas({ historial = [], onEliminar }: Props) {
  const [filtroFecha, setFiltroFecha] = useState('');
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroHistorial | null>(null);

  const historialFiltrado = filtroFecha
    ? historial.filter((h) => h.fecha === filtroFecha)
    : historial;

  const exportarPlanillaAExcel = (registro: RegistroHistorial) => {
    const datosFilas = HORARIOS_IMPARES.map((hsImp, idx) => {
      const hsPar = HORARIOS_PARES[idx];
      const p = registro.parametros?.[hsPar] || registro.parametros?.[hsImp] || {};
      const f = registro.filtrosEstado?.[hsImp] || registro.filtrosEstado?.[hsPar] || {};
      const purg = registro.purgasEstado?.[hsPar] || registro.purgasEstado?.[hsImp] || {};

      return {
        'Hora Filtros': `${hsImp}:00`,
        'Hora Parámetros': `${hsPar}:00`,
        'Caudal (m³/h)': p.caudal || '-',
        'Turb. Cruda': p.turbCruda || '-',
        'pH Cruda': p.phCruda || '-',
        'PAC (ml/min)': p.pacMlMin || '-',
        'PAC (ppm)': p.pacPpm || '-',
        'Soda (ml/min)': p.sodaMlMin || '-',
        'Soda (ppm)': p.sodaPpm || '-',
        'Turb. CAF': p.turbCaf || '-',
        'pH CAF': p.phCaf || '-',
        'Cloro (ppm)': p.cloro || '-',
        
        'Módulo A - F1 (Filtro)': f.MA_F1 || f.M1_F1 || f.F1 || '-',
        'Módulo A - F2 (Filtro)': f.MA_F2 || f.M1_F2 || f.F2 || '-',
        'Módulo A - F3 (Filtro)': f.MA_F3 || f.M1_F3 || f.F3 || '-',
        'Módulo A - F4 (Filtro)': f.MA_F4 || f.M1_F4 || f.F4 || '-',

        'Módulo B - F1 (Filtro)': f.MB_F1 || f.M2_F1 || f.F5 || '-',
        'Módulo B - F2 (Filtro)': f.MB_F2 || f.M2_F2 || f.F6 || '-',
        'Módulo B - F3 (Filtro)': f.MB_F3 || f.M2_F3 || '-',
        'Módulo B - F4 (Filtro)': f.MB_F4 || f.M2_F4 || '-',

        'Módulo A - S1 (Purga)': purg.MA_S1 || purg.M1_S1 || purg.S1 || '-',
        'Módulo A - S2 (Purga)': purg.MA_S2 || purg.M1_S2 || purg.S2 || '-',

        'Módulo B - S1 (Purga)': purg.MB_S1 || purg.M2_S1 || purg.S3 || '-',
        'Módulo B - S2 (Purga)': purg.MB_S2 || purg.M2_S2 || purg.S4 || '-',
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosFilas, { origin: "A6" } as any);
    
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["PLANILLA DE CONTROL DE PLANTA POTABILIZADORA - HISTORIAL DIARIO"],
      [`Fecha Planilla: ${registro.fecha}`, `Operadores: ${registro.operador}`],
      [`Última Modificación: ${registro.ultimaModificacion || 'Sin registro'}`],
      [`Observaciones: ${registro.observaciones}`],
      []
    ], { origin: "A1" });

    XLSX.utils.book_append_sheet(workbook, worksheet, "Planilla Control");
    XLSX.writeFile(workbook, `Planilla_${registro.fecha}.xlsx`);
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 bg-slate-100 min-h-screen text-xs">
      
      {/* TARJETA SUPERIOR DE BÚSQUEDA */}
      <div className="bg-white p-4 rounded-xl border-2 border-slate-300 shadow-sm flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Historial de Planillas Diarias Registradas
          </h2>
          <p className="text-slate-500 text-xs">
            Consulte mediciones, estados de lavado de filtros, purgas y exporte a Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-600">Buscar Fecha:</label>
          <Input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="h-8 w-40 text-xs bg-white border-slate-300"
          />
          {filtroFecha && (
            <Button
              variant="outline"
              onClick={() => setFiltroFecha('')}
              className="h-8 text-xs text-slate-600"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {!registroSeleccionado ? (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3 border-r border-slate-300">
                  Fecha <span className="font-normal italic">(año/mes/dia)</span>
                </th>
                <th className="p-3 border-r border-slate-300">Operadores del Día</th>
                <th className="p-3 border-r border-slate-300">Observaciones</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historialFiltrado.length > 0 ? (
                historialFiltrado.map((reg) => (
                  <tr key={reg.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800 border-r border-slate-200">{reg.fecha}</td>
                    <td className="p-3 border-r border-slate-200 font-bold text-slate-900">{reg.operador}</td>
                    <td className="p-3 border-r border-slate-200 text-slate-600 truncate max-w-xs">{reg.observaciones}</td>
                    <td className="p-3 text-center flex justify-center gap-2">
                      <Button
                        onClick={() => setRegistroSeleccionado(reg)}
                        className="h-7 text-xs bg-blue-700 hover:bg-blue-800 text-white"
                      >
                        Ver Detalle
                      </Button>
                      <Button
                        onClick={() => exportarPlanillaAExcel(reg)}
                        variant="outline"
                        className="h-7 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold"
                      >
                        Excel
                      </Button>
                      <Button
                        onClick={() => onEliminar?.(reg.id)}
                        variant="destructive"
                        className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold"
                      >
                        🗑️ Borrar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                    No hay planillas cargadas en el historial aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-sm p-4 flex flex-col gap-5">
          {/* ENCABEZADO DEL DETALLE */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-300 pb-3 gap-3">
            <div>
              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Planilla de Control Diaria</span>
              <h3 className="text-lg font-extrabold text-slate-900">
                Fecha Planilla: {registroSeleccionado.fecha}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                <p>
                  Operadores del Día: <strong className="text-slate-800">{registroSeleccionado.operador}</strong>
                </p>
                <p className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium">
                  Última modificación: <strong className="font-bold text-blue-900">{registroSeleccionado.ultimaModificacion || 'Sin registro'}</strong>
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={() => exportarPlanillaAExcel(registroSeleccionado)}
                className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                Descargar Excel (.xlsx)
              </Button>
              <Button
                onClick={() => setRegistroSeleccionado(null)}
                variant="outline"
                className="h-8 text-xs font-semibold"
              >
                ← Volver
              </Button>
            </div>
          </div>

          {/* CUADRO 1: PARÁMETROS FÍSICO-QUÍMICOS */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">1. Mediciones Físico-Químicas</h4>
            <div className="overflow-x-auto border-2 border-slate-400 rounded-lg">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-slate-800 text-white font-bold">
                  <tr>
                    <th className="p-2 border border-slate-500">HS</th>
                    <th className="p-2 border border-slate-500">Caudal (m³/h)</th>
                    <th className="p-2 border border-slate-500">Turb. Cruda</th>
                    <th className="p-2 border border-slate-500">pH Cruda</th>
                    <th className="p-2 border border-slate-500">PAC (ml/min)</th>
                    <th className="p-2 border border-slate-500">PAC (ppm)</th>
                    <th className="p-2 border border-slate-500">Soda (ml/min)</th>
                    <th className="p-2 border border-slate-500">Soda (ppm)</th>
                    <th className="p-2 border border-slate-500">Turb. CAF</th>
                    <th className="p-2 border border-slate-500">pH CAF</th>
                    <th className="p-2 border border-slate-500">Cloro</th>
                  </tr>
                </thead>
                <tbody>
                  {HORARIOS_PARES.map((hs) => {
                    const p = registroSeleccionado.parametros?.[hs] || {};
                    const registrado = Object.keys(p).length > 0;
                    return (
                      <tr key={hs} className={registrado ? 'bg-blue-50/70 font-semibold' : 'bg-slate-50 opacity-40'}>
                        <td className="p-1.5 border border-slate-300 font-bold bg-blue-100 text-blue-950">{hs}</td>
                        <td className="p-1.5 border border-slate-300">{p.caudal || '-'}</td>
                        <td className="p-1.5 border border-slate-300">{p.turbCruda || '-'}</td>
                        <td className="p-1.5 border border-slate-300">{p.phCruda || '-'}</td>
                        <td className="p-1.5 border border-slate-300">{p.pacMlMin || '-'}</td>
                        <td className="p-1.5 border border-slate-300 text-blue-900 font-bold">{p.pacPpm || '-'}</td>
                        <td className="p-1.5 border border-slate-300">{p.sodaMlMin || '-'}</td>
                        <td className="p-1.5 border border-slate-300 text-emerald-900 font-bold">{p.sodaPpm || '-'}</td>
                        <td className="p-1.5 border border-slate-300">{p.turbCaf || '-'}</td>
                        <td className="p-1.5 border border-slate-300">{p.phCaf || '-'}</td>
                        <td className="p-1.5 border border-slate-300 text-amber-900 font-bold">{p.cloro || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* LAVADO DE FILTROS Y PURGAS */}
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* CUADRO 2: SECCIÓN FILTROS */}
            <div className="border-2 border-slate-400 rounded-lg p-3 bg-slate-50 flex flex-col gap-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Estado / Lavado de Filtros (Módulos A y B)
              </h4>
              <div className="overflow-x-auto border-2 border-slate-300 bg-white rounded-md">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white font-bold border-b border-slate-400">
                      <th className="p-1 border border-slate-400" rowSpan={2}>HS</th>
                      <th className="p-1 border border-slate-400 bg-blue-950/80" colSpan={4}>MÓDULO A</th>
                      <th className="p-1 border border-slate-400 bg-blue-950/80" colSpan={4}>MÓDULO B</th>
                    </tr>
                    <tr className="bg-blue-800 text-white font-bold border-b border-slate-400">
                      {FILTROS_MODULO_A.map((f) => (
                        <th key={f.key} className="p-1 border border-slate-400">{f.label}</th>
                      ))}
                      {FILTROS_MODULO_B.map((f) => (
                        <th key={f.key} className="p-1 border border-slate-400">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORARIOS_IMPARES.map((hs, idx) => {
                      const hsPar = HORARIOS_PARES[idx];
                      const f = registroSeleccionado.filtrosEstado?.[hs] || registroSeleccionado.filtrosEstado?.[hsPar] || {};
                      
                      return (
                        <tr key={hs} className="border-b border-slate-300">
                          <td className="p-1 border border-slate-300 font-mono font-bold bg-slate-50">{hs}</td>
                          
                          {/* Módulo A */}
                          {FILTROS_MODULO_A.map((item) => {
                            const val = f[item.key] || f[`M1_${item.label}`] || f[item.label] || '-';
                            const esLavado = val === 'L' || val === 'Lavado';
                            const esFueraServicio = val === '/';
                            const esMarcha = val === 'M';

                            return (
                              <td
                                key={item.key}
                                className={`p-1 border border-slate-300 font-bold ${
                                  esLavado 
                                    ? 'bg-red-300 text-black font-extrabold' 
                                    : esFueraServicio 
                                    ? 'bg-slate-300 text-slate-800 font-bold' 
                                    : esMarcha 
                                    ? 'bg-emerald-200 text-emerald-950' 
                                    : 'text-slate-600'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}

                          {/* Módulo B */}
                          {FILTROS_MODULO_B.map((item, idxB) => {
                            const fallbackOld = idxB === 0 ? 'F5' : idxB === 1 ? 'F6' : '';
                            const val = f[item.key] || f[`M2_${item.label}`] || (fallbackOld ? f[fallbackOld] : '') || '-';
                            const esLavado = val === 'L' || val === 'Lavado';
                            const esFueraServicio = val === '/';
                            const esMarcha = val === 'M';

                            return (
                              <td
                                key={item.key}
                                className={`p-1 border border-slate-300 font-bold ${
                                  esLavado 
                                    ? 'bg-red-300 text-black font-extrabold' 
                                    : esFueraServicio 
                                    ? 'bg-slate-300 text-slate-800 font-bold' 
                                    : esMarcha 
                                    ? 'bg-emerald-200 text-emerald-950' 
                                    : 'text-slate-600'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CUADRO 3: SECCIÓN PURGAS */}
            <div className="border-2 border-slate-400 rounded-lg p-3 bg-slate-50 flex flex-col gap-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                Purgas de Sedimentadores (Módulos A y B)
              </h4>
              <div className="overflow-x-auto border-2 border-slate-300 bg-white rounded-md">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="bg-green-900 text-white font-bold border-b border-slate-400">
                      <th className="p-1 border border-slate-400" rowSpan={2}>HS</th>
                      <th className="p-1 border border-slate-400 bg-green-950/80" colSpan={2}>MÓDULO A</th>
                      <th className="p-1 border border-slate-400 bg-green-950/80" colSpan={2}>MÓDULO B</th>
                    </tr>
                    <tr className="bg-green-800 text-white font-bold border-b border-slate-400">
                      {PURGAS_MODULO_A.map((s) => (
                        <th key={s.key} className="p-1 border border-slate-400">{s.label}</th>
                      ))}
                      {PURGAS_MODULO_B.map((s) => (
                        <th key={s.key} className="p-1 border border-slate-400">{s.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORARIOS_PARES.map((hs, idx) => {
                      const hsImp = HORARIOS_IMPARES[idx];
                      const purg = registroSeleccionado.purgasEstado?.[hs] || registroSeleccionado.purgasEstado?.[hsImp] || {};

                      return (
                        <tr key={hs} className="border-b border-slate-300">
                          <td className="p-1 border border-slate-300 font-mono font-bold bg-slate-50">{hs}</td>
                          
                          {/* Purgas Módulo A */}
                          {PURGAS_MODULO_A.map((item) => {
                            const val = purg[item.key] || purg[`M1_${item.label}`] || purg[item.label] || '-';
                            const esPurga = val === 'P' || val === 'Purga';
                            const esFueraServicio = val === '/';

                            return (
                              <td
                                key={item.key}
                                className={`p-1 border border-slate-300 font-bold ${
                                  esPurga 
                                    ? 'bg-yellow-200/80 text-amber-950 font-extrabold' 
                                    : esFueraServicio 
                                    ? 'bg-slate-300 text-slate-800 font-bold' 
                                    : 'text-slate-600'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}

                          {/* Purgas Módulo B */}
                          {PURGAS_MODULO_B.map((item, idxB) => {
                            const fallbackOld = idxB === 0 ? 'S3' : 'S4';
                            const val = purg[item.key] || purg[`M2_${item.label}`] || purg[fallbackOld] || '-';
                            const esPurga = val === 'P' || val === 'Purga';
                            const esFueraServicio = val === '/';

                            return (
                              <td
                                key={item.key}
                                className={`p-1 border border-slate-300 font-bold ${
                                  esPurga 
                                    ? 'bg-yellow-200/80 text-amber-950 font-extrabold' 
                                    : esFueraServicio 
                                    ? 'bg-slate-300 text-slate-800 font-bold' 
                                    : 'text-slate-600'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* CUADRO 4: OBSERVACIONES GENERALES */}
          <div className="bg-slate-50 p-3 border-2 border-slate-400 rounded-lg">
            <h4 className="font-bold text-slate-700 text-xs mb-1">Observaciones Generales del Día:</h4>
            <p className="text-slate-800 text-xs leading-relaxed">{registroSeleccionado.observaciones}</p>
          </div>
        </div>
      )}
    </div>
  );
}