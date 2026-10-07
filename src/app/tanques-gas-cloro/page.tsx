'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search, X, Edit2, Check, Calendar, Sparkles, Repeat, History, Info, RotateCcw } from 'lucide-react';
import { useOperador } from '@/context/operador-context';

interface Tanque {
  id: string;
  nTk: string;
  serie: string;
  tara: string;
  ingreso: string;
  egreso: string;
  eliminado?: boolean;
}

const PALETA_COLORES = [
  {
    bg: 'bg-amber-100/90 hover:bg-amber-100 border-amber-300',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    badgeBorder: 'border-amber-400',
    bgHeader: 'bg-amber-50 text-amber-900 border-amber-200',
    tagBg: 'bg-amber-200/60 text-amber-950',
    accentColor: '#f59e0b',
  },
  {
    bg: 'bg-sky-100/90 hover:bg-sky-100 border-sky-300',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    badgeBorder: 'border-sky-400',
    bgHeader: 'bg-sky-50 text-sky-900 border-sky-200',
    tagBg: 'bg-sky-200/60 text-sky-950',
    accentColor: '#0284c7',
  },
  {
    bg: 'bg-emerald-100/90 hover:bg-emerald-100 border-emerald-300',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    badgeBorder: 'border-emerald-400',
    bgHeader: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    tagBg: 'bg-emerald-200/60 text-emerald-950',
    accentColor: '#059669',
  },
  {
    bg: 'bg-purple-100/90 hover:bg-purple-100 border-purple-300',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    badgeBorder: 'border-purple-400',
    bgHeader: 'bg-purple-50 text-purple-900 border-purple-200',
    tagBg: 'bg-purple-200/60 text-purple-950',
    accentColor: '#9333ea',
  },
  {
    bg: 'bg-rose-100/90 hover:bg-rose-100 border-rose-300',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    badgeBorder: 'border-rose-400',
    bgHeader: 'bg-rose-50 text-rose-900 border-rose-200',
    tagBg: 'bg-rose-200/60 text-rose-950',
    accentColor: '#e11d48',
  },
  {
    bg: 'bg-teal-100/90 hover:bg-teal-100 border-teal-300',
    badgeBg: 'bg-teal-600',
    badgeText: 'text-white',
    badgeBorder: 'border-teal-400',
    bgHeader: 'bg-teal-50 text-teal-900 border-teal-200',
    tagBg: 'bg-teal-200/60 text-teal-950',
    accentColor: '#0d9488',
  },
];

const initialTanquesData: Tanque[] = [
  { id: '1', nTk: '1', serie: 'SIN DATOS', tara: '596', ingreso: '29/1/2014', egreso: '23/4/2014' },
  { id: '2', nTk: '2', serie: 'SIN DATOS', tara: '659', ingreso: '23/4/2014', egreso: 'SIN DATOS' },
  { id: '3', nTk: '3', serie: 'SIN DATOS', tara: '590', ingreso: '23/4/2014', egreso: '21/8/2015' },
  { id: '4', nTk: '4', serie: 'SIN DATOS', tara: '619', ingreso: '4/9/2014', egreso: '21/8/2015' },
  { id: '5', nTk: '5', serie: 'SIN DATOS', tara: '800', ingreso: '5/2/2015', egreso: '7/11/2015' },
  { id: '6', nTk: '6', serie: 'IS 105', tara: '818', ingreso: '5/2/2015', egreso: '17/11/2015' },
  { id: '7', nTk: '7', serie: 'SIN DATOS', tara: '755', ingreso: '30/5/2015', egreso: '11/2/2016' },
  { id: '8', nTk: '8', serie: 'A 179', tara: '828', ingreso: '7/11/2015', egreso: '9/7/2016' },
  { id: '9', nTk: '9', serie: 'IS 105', tara: '760', ingreso: '15/12/2015', egreso: '20/11/2016' },
  { id: '10', nTk: '10', serie: 'N 237', tara: '764', ingreso: '11/2/2016', egreso: '20/11/2016' },
  { id: '11', nTk: '11', serie: '1140', tara: '818', ingreso: '9/7/2016', egreso: 'SIN DATOS' },
  { id: '12', nTk: '12', serie: '1179', tara: '748', ingreso: '9/7/2016', egreso: '27/9/2017' },
  { id: '13', nTk: '13', serie: 'IG 207', tara: '760', ingreso: '20/12/2016', egreso: '27/9/2017' },
  { id: '14', nTk: '14', serie: 'IS 204', tara: '835', ingreso: '20/12/2016', egreso: '6/11/2017' },
  { id: '15', nTk: '15', serie: 'SIN DATOS', tara: '640', ingreso: 'SIN DATOS', egreso: '6/11/2017' },
  { id: '16', nTk: '16', serie: 'IS 118', tara: '750', ingreso: '27/9/2017', egreso: '11/2/2018' },
  { id: '17', nTk: '17', serie: 'IS 105', tara: '760', ingreso: '27/9/2017', egreso: '11/5/2018' },
  { id: '18', nTk: '18', serie: 'IS 109', tara: '768', ingreso: '1/2/2018', egreso: '7/1/2019' },
  { id: '19', nTk: '19', serie: 'N 237', tara: '764', ingreso: '11/5/2018', egreso: '7/1/2019' },
  { id: '20', nTk: '20', serie: 'IQS 121', tara: '784', ingreso: '16/8/2018', egreso: '16/6/2019' },
  { id: '21', nTk: '21', serie: 'IS 115', tara: '767', ingreso: '16/8/2018', egreso: '16/6/2019' },
  { id: '22', nTk: '22', serie: 'A 03', tara: '800', ingreso: '7/1/2019', egreso: 'SIN DATOS' },
  { id: '23', nTk: '23', serie: 'IQS 120', tara: '855', ingreso: '1/3/2019', egreso: '10/1/2020' },
  { id: '24', nTk: '24', serie: 'IG 207', tara: '760', ingreso: '5/6/2019', egreso: '10/1/2020' },
  { id: '25', nTk: '25', serie: 'IS 105', tara: '760', ingreso: '14/6/2019', egreso: '5/9/2020' },
  { id: '26', nTk: '26', serie: 'IS 208', tara: '818', ingreso: '14/6/2019', egreso: '5/9/2020' },
  { id: '27', nTk: '27', serie: 'IS 109', tara: '768', ingreso: '10/1/2020', egreso: 'SIN DATOS' },
  { id: '28', nTk: '28', serie: 'IQ 121', tara: '784', ingreso: '10/1/2020', egreso: 'SIN DATOS' },
  { id: '29', nTk: '29', serie: 'SIN DATOS', tara: '640', ingreso: '28/8/2020', egreso: 'SIN DATOS' },
  { id: '30', nTk: '30', serie: 'A259', tara: '814', ingreso: '5/9/2020', egreso: '16/4/2021' },
  { id: '31', nTk: '31', serie: 'IG 207', tara: '760', ingreso: '5/9/2020', egreso: '3/2/2022' },
  { id: '32', nTk: '32', serie: 'IS 105', tara: '760', ingreso: '16/4/2021', egreso: '3/2/2022' },
  { id: '33', nTk: '33', serie: 'A 170', tara: '827', ingreso: '16/4/2021', egreso: '3/2/2022' },
  { id: '34', nTk: '34', serie: 'IQS 121', tara: '784', ingreso: '16/4/2021', egreso: '19/12/2022' },
  { id: '35', nTk: '35', serie: 'IS 109', tara: '768', ingreso: '16/4/2021', egreso: '19/12/2022' },
  { id: '36', nTk: '36', serie: 'IF 135', tara: '820', ingreso: '3/2/2022', egreso: '7/10/2023' },
  { id: '37', nTk: '37', serie: 'A 03', tara: '800', ingreso: '3/2/2022', egreso: '7/10/2023' },
  { id: '38', nTk: '38', serie: 'IQS 009', tara: '760', ingreso: '3/2/2022', egreso: '7/10/2023' },
  { id: '39', nTk: '39', serie: 'IS 104', tara: '759', ingreso: '3/2/2022', egreso: '19/12/2022' },
  { id: '40', nTk: '40', serie: 'SIN DATOS', tara: '827', ingreso: 'SIN DATOS', egreso: '7/10/2023' },
  { id: '41', nTk: '41', serie: 'IS 201', tara: '814', ingreso: '19/12/2022', egreso: '7/10/2023' },
  { id: '42', nTk: '42', serie: '8', tara: '800', ingreso: '19/12/2022', egreso: '7/4/2024' },
  { id: '43', nTk: '43', serie: 'A 4', tara: '815', ingreso: '19/12/2022', egreso: '7/4/2024' },
  { id: '44', nTk: '44', serie: 'IQS A 179', tara: '828', ingreso: '7/10/2023', egreso: '7/4/2024' },
  { id: '45', nTk: '45', serie: 'IQS 120', tara: '855', ingreso: '7/10/2023', egreso: '7/4/2024' },
  { id: '46', nTk: '46', serie: 'IQS 237', tara: '764', ingreso: '7/10/2023', egreso: '3/10/2024' },
  { id: '47', nTk: '47', serie: 'IS 115', tara: '767', ingreso: '7/10/2023', egreso: '3/10/2024' },
  { id: '48', nTk: '48', serie: '48428', tara: '676', ingreso: '7/4/2024', egreso: '20/3/2025' },
  { id: '49', nTk: '49', serie: 'IS 208', tara: '818', ingreso: '7/4/2024', egreso: '21/10/2025' },
  { id: '50', nTk: '50', serie: 'IF 135', tara: '820', ingreso: '7/4/2024', egreso: '20/3/2025' },
  { id: '51', nTk: '51', serie: 'IQS 135', tara: '815', ingreso: '7/4/2024', egreso: '3/10/2024' },
  { id: '52', nTk: '52', serie: '703', tara: '796', ingreso: '3/10/2024', egreso: '21/10/2025' },
  { id: '53', nTk: '53', serie: 'A 170', tara: '827', ingreso: '3/10/2024', egreso: '21/10/2025' },
  { id: '54', nTk: '54', serie: 'IQ 132', tara: '830', ingreso: '3/10/2024', egreso: '11/1/2026' },
  { id: '55', nTk: '55', serie: 'A 09', tara: '830', ingreso: '3/10/2024', egreso: '20/3/2025' },
  { id: '56', nTk: '56', serie: 'A 4', tara: '815', ingreso: '20/3/2025', egreso: '27/2/2026' },
  { id: '57', nTk: '57', serie: 'A 259', tara: '814', ingreso: '20/3/2025', egreso: '21/10/2025' },
  { id: '58', nTk: '58', serie: 'IS 109', tara: '768', ingreso: '21/10/2025', egreso: '1/6/2026' },
  { id: '59', nTk: '59', serie: '703', tara: '796', ingreso: '11/1/2026', egreso: '1/6/2026' },
  { id: '60', nTk: '60', serie: 'IF 69', tara: '790', ingreso: '27/2/2026', egreso: '' },
  { id: '61', nTk: '61', serie: 'IF 96', tara: '825', ingreso: '27/2/2026', egreso: '' },
  { id: '62', nTk: '62', serie: 'IS 201', tara: '814', ingreso: '27/2/2026', egreso: '' },
  { id: '63', nTk: '63', serie: '02 IQS', tara: '815', ingreso: '27/2/2026', egreso: '' },
  { id: '64', nTk: '64', serie: 'A 092', tara: '830', ingreso: '1/6/2026', egreso: '' },
  { id: '65', nTk: '65', serie: '', tara: '', ingreso: '', egreso: '' },
  { id: '66', nTk: '66', serie: '', tara: '', ingreso: '', egreso: '' },
  { id: '67', nTk: '67', serie: '', tara: '', ingreso: '', egreso: '' },
  { id: '68', nTk: '68', serie: '', tara: '', ingreso: '', egreso: '' },
];

export default function SeguimientoTanquesPage() {
  const { esGestorGeneral } = useOperador();
  const [isMounted, setIsMounted] = useState(false);
  const [tanques, setTanques] = useState<Tanque[]>(initialTanquesData);

  useEffect(() => {
    setIsMounted(true);
    const guardados = localStorage.getItem('tanques_gas_cloro_data');
    if (guardados) {
      try {
        setTanques(JSON.parse(guardados));
      } catch (e) {
        console.error('Error al recuperar datos:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tanques_gas_cloro_data', JSON.stringify(tanques));
    }
  }, [tanques, isMounted]);

  const [busqueda, setBusqueda] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulario
  const [nuevaSerie, setNuevaSerie] = useState('');
  const [nuevaTara, setNuevaTara] = useState('');
  const [nuevoIngreso, setNuevoIngreso] = useState('');
  const [nuevoEgreso, setNuevoEgreso] = useState('');

  // Popups
  const [showIngresoDatePopup, setShowIngresoDatePopup] = useState(false);
  const [showEgresoDatePopup, setShowEgresoDatePopup] = useState(false);
  const [activeDateInputId, setActiveDateInputId] = useState<string | null>(null);

  const getFechaHoy = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Solo considerar tanques no eliminados
  const tanquesVisibles = tanques.filter((t) => !t.eliminado);

  const proximoNTk = () => {
    const numeros = tanquesVisibles
      .map((t) => parseInt(t.nTk, 10))
      .filter((n) => !isNaN(n));
    const max = numeros.length > 0 ? Math.max(...numeros) : 0;
    return (max + 1).toString();
  };

  const estaCompletado = (valor: string | undefined | null) => {
    if (!valor) return false;
    const texto = valor.trim().toLowerCase();
    return texto !== '' && texto !== '-' && texto !== 'sin datos';
  };

  const estaFilaCompletada = (row: Tanque) => {
    return estaCompletado(row.serie) && estaCompletado(row.tara) && estaCompletado(row.ingreso);
  };

  const buscarTaraSugerida = (serieIngresada: string) => {
    const serieLimpia = serieIngresada.trim().toLowerCase();
    if (!serieLimpia || serieLimpia === 'sin datos') return null;

    const encontrado = tanquesVisibles.find(
      (t) =>
        t.serie.trim().toLowerCase() === serieLimpia &&
        t.tara.trim() !== '' &&
        t.tara.trim().toLowerCase() !== 'sin datos'
    );
    return encontrado ? encontrado.tara : null;
  };

  const taraSugerida = buscarTaraSugerida(nuevaSerie);

  const tanquesActivosEnPlanta = tanquesVisibles.filter(
    (t) => estaFilaCompletada(t) && (!t.egreso || t.egreso.trim() === '')
  );

  const reingresosMap = new Map<string, { totalApariciones: number; colorIndex: number }>();
  
  let colorCounter = 0;
  tanquesActivosEnPlanta.forEach((tanqueActivo) => {
    const serieLimpia = tanqueActivo.serie.trim().toLowerCase();

    const totalApariciones = tanquesVisibles.filter(
      (t) => t.serie.trim().toLowerCase() === serieLimpia
    ).length;

    if (totalApariciones > 1 && !reingresosMap.has(serieLimpia)) {
      reingresosMap.set(serieLimpia, {
        totalApariciones,
        colorIndex: colorCounter % PALETA_COLORES.length,
      });
      colorCounter++;
    }
  });

  const getEstilosTanque = (serie: string) => {
    const serieLimpia = serie.trim().toLowerCase();
    const infoReingreso = reingresosMap.get(serieLimpia);

    if (!infoReingreso) return null;

    const colorConfig = PALETA_COLORES[infoReingreso.colorIndex];
    return {
      ...colorConfig,
      totalApariciones: infoReingreso.totalApariciones,
    };
  };

  const tanquesFiltrados = tanquesVisibles.filter((t) => {
    if (!busqueda.trim()) return true;
    const term = busqueda.toLowerCase().trim();
    return (
      t.nTk.toLowerCase().includes(term) ||
      t.serie.toLowerCase().includes(term)
    );
  });

  const sortedTanques = [...tanquesFiltrados].sort((a, b) => {
    const numA = parseInt(a.nTk, 10) || 0;
    const numB = parseInt(b.nTk, 10) || 0;
    return numA - numB;
  });

  const half = Math.ceil(sortedTanques.length / 2);
  const colIzquierda = sortedTanques.slice(0, half);
  const colDerecha = sortedTanques.slice(half);

  const handleCellChange = (id: string, field: keyof Tanque, value: string) => {
    setTanques((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAgregar = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevo: Tanque = {
      id: Date.now().toString(),
      nTk: proximoNTk(),
      serie: nuevaSerie.trim(),
      tara: nuevaTara.trim(),
      ingreso: nuevoIngreso.trim(),
      egreso: nuevoEgreso.trim(),
      eliminado: false,
    };

    setTanques((prev) => [...prev, nuevo]);
    setNuevaSerie('');
    setNuevaTara('');
    setNuevoIngreso('');
    setNuevoEgreso('');
    setShowIngresoDatePopup(false);
    setShowEgresoDatePopup(false);
  };

  // BORRADO SUAVE RESTRINGIDO A GESTOR GENERAL
  const handleEliminar = (id: string) => {
    if (!esGestorGeneral) return;

    const confirmar = window.confirm('¿Deseas mover este registro a Datos Borrados?');
    if (!confirmar) return;

    setTanques((prev) =>
      prev.map((item) => (item.id === id ? { ...item, eliminado: true } : item))
    );
  };

  const handleRestaurarIniciales = () => {
    if (!esGestorGeneral) {
      alert('Esta acción requiere permisos de Gestor General.');
      return;
    }
    if (confirm('¿Deseas restaurar la lista a sus valores iniciales? Se perderán las modificaciones locales.')) {
      setTanques(initialTanquesData);
      localStorage.removeItem('tanques_gas_cloro_data');
    }
  };

  if (!isMounted) return null;

  const renderTable = (dataSlice: Tanque[]) => (
    <Table className="w-full text-center text-xs border-collapse">
      <TableHeader className="bg-slate-100 border-b">
        <TableRow>
          <TableHead className="font-extrabold text-slate-800 bg-slate-200 border-r w-12 text-center p-1">
            N° TK
          </TableHead>
          <TableHead className="font-bold text-blue-950 bg-blue-50 border-r text-center p-1">
            SERIE
          </TableHead>
          <TableHead className="font-bold text-blue-950 bg-blue-50 border-r text-center p-1">
            TARA
          </TableHead>
          <TableHead className="font-bold text-blue-950 bg-blue-50 border-r text-center p-1">
            INGRESO
          </TableHead>
          <TableHead className="font-bold text-blue-950 bg-blue-50 border-r text-center p-1">
            EGRESO
          </TableHead>
          <TableHead className="w-14 bg-blue-50 text-center p-1">ACCIONES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataSlice.map((row) => {
          const isEditing = editingId === row.id;
          const estiloReingreso = estaFilaCompletada(row) ? getEstilosTanque(row.serie) : null;
          const estaValidoEnPlanta = estaFilaCompletada(row) && (!row.egreso || row.egreso.trim() === '');

          return (
            <TableRow
              key={row.id}
              className={`border-b transition-colors ${
                estiloReingreso
                  ? `${estiloReingreso.bg} font-medium`
                  : 'hover:bg-slate-50'
              }`}
            >
              {/* N° TK */}
              <TableCell className={`p-0.5 border-r font-black ${estiloReingreso ? estiloReingreso.tagBg : 'bg-slate-100 text-slate-800'}`}>
                {isEditing ? (
                  <input
                    type="text"
                    value={row.nTk}
                    onChange={(e) => handleCellChange(row.id, 'nTk', e.target.value)}
                    className="w-full text-center font-black bg-white border border-blue-400 rounded p-0 text-xs"
                  />
                ) : (
                  <span>{row.nTk}</span>
                )}
              </TableCell>

              {/* SERIE */}
              <TableCell className="p-0.5 border-r font-bold text-slate-800">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.serie}
                    onChange={(e) => handleCellChange(row.id, 'serie', e.target.value)}
                    className="w-full text-center font-bold bg-white border border-blue-400 rounded p-0 text-xs"
                  />
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <span>{row.serie || '-'}</span>
                    {estiloReingreso && (
                      <span className={`${estiloReingreso.badgeBg} ${estiloReingreso.badgeText} text-[9px] px-1 py-0.2 rounded font-extrabold flex items-center gap-0.5 shadow-sm`} title={`Tanque con ${estiloReingreso.totalApariciones} reingresos`}>
                        <Repeat className="w-2.5 h-2.5" /> REINGRESO
                      </span>
                    )}
                  </div>
                )}
              </TableCell>

              {/* TARA */}
              <TableCell className="p-0.5 border-r font-mono text-slate-700">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.tara}
                    onChange={(e) => handleCellChange(row.id, 'tara', e.target.value)}
                    className="w-full text-center font-mono bg-white border border-blue-400 rounded p-0 text-xs"
                  />
                ) : (
                  <span>{row.tara || '-'}</span>
                )}
              </TableCell>

              {/* INGRESO */}
              <TableCell className="p-0.5 border-r font-mono text-slate-700 relative">
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={row.ingreso}
                      onFocus={() => setActiveDateInputId(`${row.id}-ingreso`)}
                      onBlur={() => setTimeout(() => setActiveDateInputId(null), 200)}
                      onChange={(e) => handleCellChange(row.id, 'ingreso', e.target.value)}
                      className="w-full text-center font-mono bg-white border border-blue-400 rounded p-0 text-xs"
                    />
                    {activeDateInputId === `${row.id}-ingreso` && (
                      <button
                        type="button"
                        onMouseDown={() => handleCellChange(row.id, 'ingreso', getFechaHoy())}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] px-2 py-0.5 rounded shadow-md z-30 flex items-center gap-1 whitespace-nowrap hover:bg-blue-800"
                      >
                        <Calendar className="w-3 h-3 text-blue-300" /> Usar hoy ({getFechaHoy()})
                      </button>
                    )}
                  </div>
                ) : (
                  <span>{row.ingreso || '-'}</span>
                )}
              </TableCell>

              {/* EGRESO */}
              <TableCell className="p-0.5 border-r font-mono text-slate-700 relative">
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={row.egreso}
                      onFocus={() => setActiveDateInputId(`${row.id}-egreso`)}
                      onBlur={() => setTimeout(() => setActiveDateInputId(null), 200)}
                      onChange={(e) => handleCellChange(row.id, 'egreso', e.target.value)}
                      className="w-full text-center font-mono bg-white border border-blue-400 rounded p-0 text-xs"
                    />
                    {activeDateInputId === `${row.id}-egreso` && (
                      <button
                        type="button"
                        onMouseDown={() => handleCellChange(row.id, 'egreso', getFechaHoy())}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] px-2 py-0.5 rounded shadow-md z-30 flex items-center gap-1 whitespace-nowrap hover:bg-blue-800"
                      >
                        <Calendar className="w-3 h-3 text-blue-300" /> Usar hoy ({getFechaHoy()})
                      </button>
                    )}
                  </div>
                ) : (
                  <span>
                    {row.egreso ? (
                      row.egreso
                    ) : estaValidoEnPlanta ? (
                      <span className="text-emerald-800 font-bold text-[10px] bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
                        En Planta
                      </span>
                    ) : (
                      ''
                    )}
                  </span>
                )}
              </TableCell>

              {/* ACCIONES */}
              <TableCell className="p-0 text-center">
                <div className="flex items-center justify-center gap-1">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-emerald-600 hover:text-emerald-800 p-1"
                      title="Guardar cambios"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingId(row.id)}
                      className="text-slate-400 hover:text-blue-700 p-1"
                      title="Editar registro"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {esGestorGeneral && (
                    <button
                      type="button"
                      onClick={() => handleEliminar(row.id)}
                      className="text-slate-300 hover:text-red-600 transition-colors p-1"
                      title="Ocultar/Mover a datos borrados"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4 md:p-6 space-y-6 text-xs text-slate-800">
      
      {/* ENCABEZADO Y BUSCADOR */}
      <Card className="w-full max-w-7xl mx-auto shadow-sm border bg-white">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 gap-4">
          <div>
            <CardTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Seguimiento Tanques Gas Cloro
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Planilla interactiva de registro, ingresos y egresos de tanques.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {esGestorGeneral && (
              <Button
                onClick={handleRestaurarIniciales}
                variant="outline"
                size="sm"
                className="h-8 text-[11px] text-slate-600 border-slate-300 hover:bg-slate-50 gap-1"
                title="Restaurar a la lista por defecto"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                Restaurar Datos
              </Button>
            )}

            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por N° TK o Serie..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="h-8 w-full sm:w-56 text-xs font-bold bg-white"
              />
              {busqueda && (
                <Button
                  onClick={() => setBusqueda('')}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-slate-500 hover:text-slate-800 px-2"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* FORMULARIO DE INGRESO */}
      <Card className="w-full max-w-7xl mx-auto shadow-sm border bg-white">
        <CardContent className="p-3">
          <form onSubmit={handleAgregar} className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-600 text-xs uppercase tracking-wider mr-1">
              + Nuevo Tanque:
            </span>

            <div className="flex items-center bg-slate-100 border rounded px-2.5 h-8 font-black text-slate-800 text-xs" title="Número asignado automáticamente">
              N° {proximoNTk()}
            </div>

            <Input
              type="text"
              placeholder="Serie (ej: IS 201)"
              value={nuevaSerie}
              onChange={(e) => setNuevaSerie(e.target.value)}
              className="h-8 w-32 text-xs font-bold bg-white"
            />

            <div className="relative">
              <Input
                type="text"
                placeholder="Tara (ej: 814)"
                value={nuevaTara}
                onChange={(e) => setNuevaTara(e.target.value)}
                className="h-8 w-24 text-xs font-bold bg-white"
              />
              {taraSugerida && nuevaTara !== taraSugerida && (
                <button
                  type="button"
                  onClick={() => setNuevaTara(taraSugerida)}
                  className="absolute -top-7 left-0 bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded shadow z-20 flex items-center gap-1 whitespace-nowrap font-bold"
                >
                  <Sparkles className="w-3 h-3 text-amber-100" /> Usar Tara previa ({taraSugerida} kg)
                </button>
              )}
            </div>

            <div className="relative">
              <Input
                type="text"
                placeholder="Ingreso (dd/mm/aaaa)"
                value={nuevoIngreso}
                onFocus={() => setShowIngresoDatePopup(true)}
                onBlur={() => setTimeout(() => setShowIngresoDatePopup(false), 200)}
                onChange={(e) => setNuevoIngreso(e.target.value)}
                className="h-8 w-32 text-xs font-bold bg-white"
              />
              {showIngresoDatePopup && (
                <button
                  type="button"
                  onMouseDown={() => setNuevoIngreso(getFechaHoy())}
                  className="absolute -top-7 left-0 bg-blue-900 hover:bg-blue-800 text-white text-[10px] px-2 py-0.5 rounded shadow z-20 flex items-center gap-1 whitespace-nowrap font-medium"
                >
                  <Calendar className="w-3 h-3 text-blue-300" /> Hoy: {getFechaHoy()}
                </button>
              )}
            </div>

            <div className="relative">
              <Input
                type="text"
                placeholder="Egreso (dd/mm/aaaa)"
                value={nuevoEgreso}
                onFocus={() => setShowEgresoDatePopup(true)}
                onBlur={() => setTimeout(() => setShowEgresoDatePopup(false), 200)}
                onChange={(e) => setNuevoEgreso(e.target.value)}
                className="h-8 w-32 text-xs font-bold bg-white"
              />
              {showEgresoDatePopup && (
                <button
                  type="button"
                  onMouseDown={() => setNuevoEgreso(getFechaHoy())}
                  className="absolute -top-7 left-0 bg-blue-900 hover:bg-blue-800 text-white text-[10px] px-2 py-0.5 rounded shadow z-20 flex items-center gap-1 whitespace-nowrap font-medium"
                >
                  <Calendar className="w-3 h-3 text-blue-300" /> Hoy: {getFechaHoy()}
                </button>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs bg-blue-900 hover:bg-blue-950 text-white font-bold px-3 shadow-none gap-1 ml-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar N° {proximoNTk()}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* SECCIÓN PRINCIPAL */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-4 items-start">
        
        <Card className="xl:col-span-3 shadow-sm border border-blue-200 bg-white overflow-hidden">
          <CardHeader className="bg-blue-900 text-white p-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wide text-white">
                Registro de Tanques ({sortedTanques.length} Tanques Visibles)
              </CardTitle>
              <CardDescription className="text-[11px] text-blue-200">
                Control e inventario histórico de tanques de gas cloro
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-800 text-blue-100 text-[10px] px-2 py-0.5 rounded font-medium border border-blue-700">
                En Planta Activos: {tanquesActivosEnPlanta.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-x-auto">
              <div>{renderTable(colIzquierda)}</div>
              <div>{renderTable(colDerecha)}</div>
            </div>
          </CardContent>
        </Card>

        {/* PANEL LATERAL */}
        <Card className="xl:col-span-1 shadow-sm border border-amber-200 bg-white">
          <CardHeader className="bg-slate-900 text-white p-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
              <Repeat className="w-4 h-4 text-amber-400" />
              Reingresos en Planta
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-300">
              Tanques actualmente activos que ya estuvieron antes en el historial
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 space-y-2.5">
            {reingresosMap.size === 0 ? (
              <div className="text-center py-6 text-slate-400 bg-slate-50 rounded border border-dashed p-3">
                <Info className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                <p className="text-[11px] font-medium">Sin reingresos activos</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Todos los tanques en planta corresponden a su primer ingreso.
                </p>
              </div>
            ) : (
              Array.from(reingresosMap.entries()).map(([serieLimpia, info]) => {
                const colorConfig = PALETA_COLORES[info.colorIndex];
                const tanqueOriginal = tanquesVisibles.find(
                  (t) => t.serie.trim().toLowerCase() === serieLimpia
                );
                const serieOriginal = tanqueOriginal ? tanqueOriginal.serie : serieLimpia;

                return (
                  <div
                    key={serieLimpia}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${colorConfig.bgHeader} transition-all shadow-sm`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border shadow-sm flex-shrink-0"
                        style={{ backgroundColor: colorConfig.accentColor }}
                      />
                      <div>
                        <p className="font-extrabold text-xs text-slate-900 leading-none">
                          {serieOriginal}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Tanque repetido en planta
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black ${colorConfig.badgeBg} ${colorConfig.badgeText} shadow-xs`}>
                        <History className="w-3 h-3" />
                        {info.totalApariciones} veces
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            <div className="pt-2 border-t text-[10px] text-slate-500 leading-relaxed flex items-start gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Cada tanque con reingreso en planta recibe su propio color diferencial tanto en el resumen como en la tabla.
              </span>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}