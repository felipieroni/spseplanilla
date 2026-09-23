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
  parametros?: Record<string, Record<string, string>>;
  filtrosEstado?: Record<string, Record<string, string>>;
  purgasEstado?: Record<string, Record<string, string>>;
  bombasEstado?: Record<string, Record<string, string>>;
}

const HORARIOS = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];

// ESTRUCTURA EN MÓDULO A Y MÓDULO B SINCRONIZADA CON LA PÁGINA PRINCIPAL
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
}

export default function HistorialPlanillas({ historial = [] }: Props) {
  const [filtroFecha, setFiltroFecha] = useState('');
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroHistorial | null>(null);

  const historialFiltrado = filtroFecha
    ? historial.filter((h) => h.fecha === filtroFecha)
    : historial;

  // FUNCIÓN EXPORTAR A EXCEL CON MÓDULO A Y MÓDULO B
  const exportarPlanillaAExcel = (registro: RegistroHistorial) => {
    const datosFilas = HORARIOS.map((hs) => {
      const p = registro.parametros?.[hs] || {};
      const f = registro.filtrosEstado?.[hs] || {};
      const purg = registro.purgasEstado?.[hs] || {};

      return {
        Hora: `${hs}:00`,
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
        
        // MÓDULO A - FILTROS (con fallback a registros viejos M1/F1..F4)
        'Módulo A - F1 (Filtro)': f.MA_F1 || f.M1_F1 || f.F1 || '-',
        'Módulo A - F2 (Filtro)': f.MA_F2 || f.M1_F2 || f.F2 || '-',
        'Módulo A - F3 (Filtro)': f.MA_F3 || f.M1_F3 || f.F3 || '-',
        'Módulo A - F4 (Filtro)': f.MA_F4 || f.M1_F4 || f.F4 || '-',

        // MÓDULO B - FILTROS (con fallback a registros viejos M2/F5/F6)
        'Módulo B - F1 (Filtro)': f.MB_F1 || f.M2_F1 || f.F5 || '-',
        'Módulo B - F2 (Filtro)': f.MB_F2 || f.M2_F2 || f.F6 || '-',
        'Módulo B - F3 (Filtro)': f.MB_F3 || f.M2_F3 || '-',
        'Módulo B - F4 (Filtro)': f.MB_F4 || f.M2_F4 || '-',

        // MÓDULO A - PURGAS
        'Módulo A - S1 (Purga)': purg.MA_S1 || purg.M1_S1 || purg.S1 || '-',
        'Módulo A - S2 (Purga)': purg.MA_S2 || purg.M1_S2 || purg.S2 || '-',

        // MÓDULO B - PURGAS
        'Módulo B - S1 (Purga)': purg.MB_S1 || purg.M2_S1 || purg.S3 || '-',
        'Módulo B - S2 (Purga)': purg.MB_S2 || purg.M2_S2 || purg.S4 || '-',
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosFilas, { origin: "A5" } as any);
    
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["PLANILLA DE CONTROL DE PLANTA POTABILIZADORA - HISTORIAL"],
      [`Fecha: ${registro.fecha}`, `Turno: ${registro.turno}`, `Operador: ${registro.operador}`],
      [`Observaciones: ${registro.observaciones}`],
      []
    ], { origin: "A1" });

    XLSX.utils.book_append_sheet(workbook, worksheet, "Planilla Control");
    XLSX.writeFile(workbook, `Planilla_${registro.fecha}_Turno_${registro.turno.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 bg-slate-100 min-h-screen text-xs">
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Historial de Planillas Registradas
          </h2>
          <p className="text-slate-500 text-xs">
            Consulte mediciones, estados de lavado de filtros, purgas y exporte a Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-600">Filtrar Fecha:</label>
          <Input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="h-8 w-40 text-xs bg-white"
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
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-200 text-slate-800 font-bold border-b">
              <tr>
                <th className="p-3 border-r">Fecha</th>
                <th className="p-3 border-r">Turno</th>
                <th className="p-3 border-r">Operador</th>
                <th className="p-3 border-r">Observaciones</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historialFiltrado.length > 0 ? (
                historialFiltrado.map((reg) => (
                  <tr key={reg.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800 border-r">{reg.fecha}</td>
                    <td className="p-3 border-r font-medium text-slate-700">{reg.turno}</td>
                    <td className="p-3 border-r font-bold text-slate-900">{reg.operador}</td>
                    <td className="p-3 border-r text-slate-600 truncate max-w-xs">{reg.observaciones}</td>
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                    No hay planillas cargadas en el historial aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* VISTA DETALLADA COMPLETA CON ESTRUCTURA DE MÓDULO A Y MÓDULO B */
        <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-5">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Planilla de Control</span>
              <h3 className="text-lg font-extrabold text-slate-900">
                {registroSeleccionado.fecha} — Turno: {registroSeleccionado.turno}
              </h3>
              <p className="text-xs text-slate-600">
                Operador: <strong className="text-slate-800">{registroSeleccionado.operador}</strong>
              </p>
            </div>
            <div className="flex gap-2">
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

          {/* TABLA PRINCIPAL PARÁMETROS */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">1. Mediciones Físico-Químicas</h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-slate-800 text-white font-bold">
                  <tr>
                    <th className="p-2 border">HS</th>
                    <th className="p-2 border">Caudal (m³/h)</th>
                    <th className="p-2 border">Turb. Cruda</th>
                    <th className="p-2 border">pH Cruda</th>
                    <th className="p-2 border">PAC (ml/min)</th>
                    <th className="p-2 border">PAC (ppm)</th>
                    <th className="p-2 border">Soda (ml/min)</th>
                    <th className="p-2 border">Soda (ppm)</th>
                    <th className="p-2 border">Turb. CAF</th>
                    <th className="p-2 border">pH CAF</th>
                    <th className="p-2 border">Cloro</th>
                  </tr>
                </thead>
                <tbody>
                  {HORARIOS.map((hs) => {
                    const p = registroSeleccionado.parametros?.[hs] || {};
                    const registrado = Object.keys(p).length > 0;
                    return (
                      <tr key={hs} className={registrado ? 'bg-amber-50/60 font-semibold' : 'bg-slate-50 opacity-40'}>
                        <td className="p-1.5 border font-bold bg-slate-100">{hs}</td>
                        <td className="p-1.5 border">{p.caudal || '-'}</td>
                        <td className="p-1.5 border">{p.turbCruda || '-'}</td>
                        <td className="p-1.5 border">{p.phCruda || '-'}</td>
                        <td className="p-1.5 border">{p.pacMlMin || '-'}</td>
                        <td className="p-1.5 border text-blue-900 font-bold">{p.pacPpm || '-'}</td>
                        <td className="p-1.5 border">{p.sodaMlMin || '-'}</td>
                        <td className="p-1.5 border text-emerald-900 font-bold">{p.sodaPpm || '-'}</td>
                        <td className="p-1.5 border">{p.turbCaf || '-'}</td>
                        <td className="p-1.5 border">{p.phCaf || '-'}</td>
                        <td className="p-1.5 border text-amber-900 font-bold">{p.cloro || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BLOQUE SECUNDARIO: LAVADO DE FILTROS Y PURGAS EN MÓDULO A Y MÓDULO B */}
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* SECCIÓN FILTROS (MÓDULO A Y MÓDULO B) */}
            <div className="border rounded-lg p-3 bg-slate-50 flex flex-col gap-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Estado / Lavado de Filtros (Módulos A y B)
              </h4>
              <div className="overflow-x-auto border bg-white rounded-md">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-300 text-slate-800 font-bold border-b">
                      <th className="p-1 border" rowSpan={2}>HS</th>
                      <th className="p-1 border bg-cyan-100 text-cyan-900" colSpan={4}>MÓDULO A</th>
                      <th className="p-1 border bg-blue-100 text-blue-900" colSpan={4}>MÓDULO B</th>
                    </tr>
                    <tr className="bg-slate-200 text-slate-800 font-bold">
                      {FILTROS_MODULO_A.map((f) => (
                        <th key={f.key} className="p-1 border">{f.label}</th>
                      ))}
                      {FILTROS_MODULO_B.map((f) => (
                        <th key={f.key} className="p-1 border">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORARIOS.map((hs) => {
                      const f = registroSeleccionado.filtrosEstado?.[hs] || {};
                      return (
                        <tr key={hs} className="border-b">
                          <td className="p-1 border font-mono font-bold bg-slate-50">{hs}</td>
                          
                          {/* Módulo A */}
                          {FILTROS_MODULO_A.map((item) => {
                            const val = f[item.key] || f[`M1_${item.label}`] || f[item.label] || '-';
                            const esLavado = val === 'L' || val === 'Lavado';
                            return (
                              <td
                                key={item.key}
                                className={`p-1 border font-bold ${
                                  esLavado ? 'bg-sky-200 text-sky-900 font-extrabold' : 'text-slate-600'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}

                          {/* Módulo B */}
                          {FILTROS_MODULO_B.map((item, idx) => {
                            const fallbackOld = idx === 0 ? 'F5' : idx === 1 ? 'F6' : '';
                            const val = f[item.key] || f[`M2_${item.label}`] || (fallbackOld ? f[fallbackOld] : '') || '-';
                            const esLavado = val === 'L' || val === 'Lavado';
                            return (
                              <td
                                key={item.key}
                                className={`p-1 border font-bold ${
                                  esLavado ? 'bg-sky-200 text-sky-900 font-extrabold' : 'text-slate-600'
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

            {/* SECCIÓN PURGAS (MÓDULO A Y MÓDULO B) */}
            <div className="border rounded-lg p-3 bg-slate-50 flex flex-col gap-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                Purgas de Sedimentadores (Módulos A y B)
              </h4>
              <div className="overflow-x-auto border bg-white rounded-md">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-300 text-slate-800 font-bold border-b">
                      <th className="p-1 border" rowSpan={2}>HS</th>
                      <th className="p-1 border bg-amber-100 text-amber-900" colSpan={2}>MÓDULO A</th>
                      <th className="p-1 border bg-orange-100 text-orange-900" colSpan={2}>MÓDULO B</th>
                    </tr>
                    <tr className="bg-slate-200 text-slate-800 font-bold">
                      {PURGAS_MODULO_A.map((s) => (
                        <th key={s.key} className="p-1 border">{s.label}</th>
                      ))}
                      {PURGAS_MODULO_B.map((s) => (
                        <th key={s.key} className="p-1 border">{s.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORARIOS.map((hs) => {
                      const purg = registroSeleccionado.purgasEstado?.[hs] || {};
                      return (
                        <tr key={hs} className="border-b">
                          <td className="p-1 border font-mono font-bold bg-slate-50">{hs}</td>
                          
                          {/* Purgas Módulo A */}
                          {PURGAS_MODULO_A.map((item) => {
                            const val = purg[item.key] || purg[`M1_${item.label}`] || purg[item.label] || '-';
                            const esPurga = val === 'P' || val === 'Purga';
                            return (
                              <td
                                key={item.key}
                                className={`p-1 border font-bold ${
                                  esPurga ? 'bg-amber-200 text-amber-900 font-extrabold' : 'text-slate-600'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}

                          {/* Purgas Módulo B */}
                          {PURGAS_MODULO_B.map((item, idx) => {
                            const fallbackOld = idx === 0 ? 'S3' : 'S4';
                            const val = purg[item.key] || purg[`M2_${item.label}`] || purg[fallbackOld] || '-';
                            const esPurga = val === 'P' || val === 'Purga';
                            return (
                              <td
                                key={item.key}
                                className={`p-1 border font-bold ${
                                  esPurga ? 'bg-amber-200 text-amber-900 font-extrabold' : 'text-slate-600'
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

          {/* OBSERVACIONES DEL TURNO */}
          <div className="bg-slate-50 p-3 border rounded-lg">
            <h4 className="font-bold text-slate-700 text-xs mb-1">Observaciones del Turno:</h4>
            <p className="text-slate-800 text-xs leading-relaxed">{registroSeleccionado.observaciones}</p>
          </div>
        </div>
      )}
    </div>
  );
}