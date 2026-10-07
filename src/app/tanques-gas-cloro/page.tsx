'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search, X, Edit2, Check, Calendar, Sparkles, Repeat, History, Info } from 'lucide-react';
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
    bg: 'bg-emerald-100/90 hover:bg-emerald-100 border-emerald-300',
    badgeBg: 'bg-emerald-700',
    badgeText: 'text-white',
    badgeBorder: 'border-emerald-500',
    bgHeader: 'bg-emerald-50 text-emerald-950 border-emerald-200',
    tagBg: 'bg-emerald-200/70 text-emerald-950',
    accentColor: '#15803d',
  },
  {
    bg: 'bg-sky-100/90 hover:bg-sky-100 border-sky-300',
    badgeBg: 'bg-sky-700',
    badgeText: 'text-white',
    badgeBorder: 'border-sky-500',
    bgHeader: 'bg-sky-50 text-sky-950 border-sky-200',
    tagBg: 'bg-sky-200/70 text-sky-950',
    accentColor: '#0369a1',
  },
  {
    bg: 'bg-amber-100/90 hover:bg-amber-100 border-amber-300',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
    badgeBorder: 'border-amber-400',
    bgHeader: 'bg-amber-50 text-amber-950 border-amber-200',
    tagBg: 'bg-amber-200/70 text-amber-950',
    accentColor: '#d97706',
  },
  {
    bg: 'bg-purple-100/90 hover:bg-purple-100 border-purple-300',
    badgeBg: 'bg-purple-700',
    badgeText: 'text-white',
    badgeBorder: 'border-purple-500',
    bgHeader: 'bg-purple-50 text-purple-950 border-purple-200',
    tagBg: 'bg-purple-200/70 text-purple-950',
    accentColor: '#7e22ce',
  },
  {
    bg: 'bg-teal-100/90 hover:bg-teal-100 border-teal-300',
    badgeBg: 'bg-teal-700',
    badgeText: 'text-white',
    badgeBorder: 'border-teal-500',
    bgHeader: 'bg-teal-50 text-teal-950 border-teal-200',
    tagBg: 'bg-teal-200/70 text-teal-950',
    accentColor: '#0f766e',
  },
  {
    bg: 'bg-rose-100/90 hover:bg-rose-100 border-rose-300',
    badgeBg: 'bg-rose-700',
    badgeText: 'text-white',
    badgeBorder: 'border-rose-500',
    bgHeader: 'bg-rose-50 text-rose-950 border-rose-200',
    tagBg: 'bg-rose-200/70 text-rose-950',
    accentColor: '#be123c',
  },
];

const initialTanquesData: Tanque[] = [
  { id: '1', nTk: '1', serie: 'SIN DATOS', tara: '596', ingreso: '29/1/2014', egreso: '23/4/2014', eliminado: false },
  { id: '2', nTk: '2', serie: 'SIN DATOS', tara: '659', ingreso: '23/4/2014', egreso: 'SIN DATOS', eliminado: false },
  { id: '3', nTk: '3', serie: 'SIN DATOS', tara: '590', ingreso: '23/4/2014', egreso: '21/8/2015', eliminado: false },
  { id: '4', nTk: '4', serie: 'SIN DATOS', tara: '619', ingreso: '4/9/2014', egreso: '21/8/2015', eliminado: false },
  { id: '5', nTk: '5', serie: 'SIN DATOS', tara: '800', ingreso: '5/2/2015', egreso: '7/11/2015', eliminado: false },
  { id: '6', nTk: '6', serie: 'IS 105', tara: '818', ingreso: '5/2/2015', egreso: '17/11/2015', eliminado: false },
  { id: '7', nTk: '7', serie: 'SIN DATOS', tara: '755', ingreso: '30/5/2015', egreso: '11/2/2016', eliminado: false },
  { id: '8', nTk: '8', serie: 'A 179', tara: '828', ingreso: '7/11/2015', egreso: '9/7/2016', eliminado: false },
  { id: '9', nTk: '9', serie: 'IS 105', tara: '760', ingreso: '15/12/2015', egreso: '20/11/2016', eliminado: false },
  { id: '10', nTk: '10', serie: 'N 237', tara: '764', ingreso: '11/2/2016', egreso: '20/11/2016', eliminado: false },
  { id: '11', nTk: '11', serie: '1140', tara: '818', ingreso: '9/7/2016', egreso: 'SIN DATOS', eliminado: false },
  { id: '12', nTk: '12', serie: '1179', tara: '748', ingreso: '9/7/2016', egreso: '27/9/2017', eliminado: false },
  { id: '13', nTk: '13', serie: 'IG 207', tara: '760', ingreso: '20/12/2016', egreso: '27/9/2017', eliminado: false },
  { id: '14', nTk: '14', serie: 'IS 204', tara: '835', ingreso: '20/12/2016', egreso: '6/11/2017', eliminado: false },
  { id: '15', nTk: '15', serie: 'SIN DATOS', tara: '640', ingreso: 'SIN DATOS', egreso: '6/11/2017', eliminado: false },
  { id: '16', nTk: '16', serie: 'IS 118', tara: '750', ingreso: '27/9/2017', egreso: '11/2/2018', eliminado: false },
  { id: '17', nTk: '17', serie: 'IS 105', tara: '760', ingreso: '27/9/2017', egreso: '11/5/2018', eliminado: false },
  { id: '18', nTk: '18', serie: 'IS 109', tara: '768', ingreso: '1/2/2018', egreso: '7/1/2019', eliminado: false },
  { id: '19', nTk: '19', serie: 'N 237', tara: '764', ingreso: '11/5/2018', egreso: '7/1/2019', eliminado: false },
  { id: '20', nTk: '20', serie: 'IQS 121', tara: '784', ingreso: '16/8/2018', egreso: '16/6/2019', eliminado: false },
  { id: '21', nTk: '21', serie: 'IS 115', tara: '767', ingreso: '16/8/2018', egreso: '16/6/2019', eliminado: false },
  { id: '22', nTk: '22', serie: 'A 03', tara: '800', ingreso: '7/1/2019', egreso: 'SIN DATOS', eliminado: false },
  { id: '23', nTk: '23', serie: 'IQS 120', tara: '855', ingreso: '1/3/2019', egreso: '10/1/2020', eliminado: false },
  { id: '24', nTk: '24', serie: 'IG 207', tara: '760', ingreso: '5/6/2019', egreso: '10/1/2020', eliminado: false },
  { id: '25', nTk: '25', serie: 'IS 105', tara: '760', ingreso: '14/6/2019', egreso: '5/9/2020', eliminado: false },
  { id: '26', nTk: '26', serie: 'IS 208', tara: '818', ingreso: '14/6/2019', egreso: '5/9/2020', eliminado: false },
  { id: '27', nTk: '27', serie: 'IS 109', tara: '768', ingreso: '10/1/2020', egreso: 'SIN DATOS', eliminado: false },
  { id: '28', nTk: '28', serie: 'IQ 121', tara: '784', ingreso: '10/1/2020', egreso: 'SIN DATOS', eliminado: false },
  { id: '29', nTk: '29', serie: 'SIN DATOS', tara: '640', ingreso: '28/8/2020', egreso: 'SIN DATOS', eliminado: false },
  { id: '30', nTk: '30', serie: 'A259', tara: '814', ingreso: '5/9/2020', egreso: '16/4/2021', eliminado: false },
  { id: '31', nTk: '31', serie: 'IG 207', tara: '760', ingreso: '5/9/2020', egreso: '3/2/2022', eliminado: false },
  { id: '32', nTk: '32', serie: 'IS 105', tara: '760', ingreso: '16/4/2021', egreso: '3/2/2022', eliminado: false },
  { id: '33', nTk: '33', serie: 'A 170', tara: '827', ingreso: '16/4/2021', egreso: '3/2/2022', eliminado: false },
  { id: '34', nTk: '34', serie: 'IQS 121', tara: '784', ingreso: '16/4/2021', egreso: '19/12/2022', eliminado: false },
  { id: '35', nTk: '35', serie: 'IS 109', tara: '768', ingreso: '16/4/2021', egreso: '19/12/2022', eliminado: false },
  { id: '36', nTk: '36', serie: 'IF 135', tara: '820', ingreso: '3/2/2022', egreso: '7/10/2023', eliminado: false },
  { id: '37', nTk: '37', serie: 'A 03', tara: '800', ingreso: '3/2/2022', egreso: '7/10/2023', eliminado: false },
  { id: '38', nTk: '38', serie: 'IQS 009', tara: '760', ingreso: '3/2/2022', egreso: '7/10/2023', eliminado: false },
  { id: '39', nTk: '39', serie: 'IS 104', tara: '759', ingreso: '3/2/2022', egreso: '19/12/2022', eliminado: false },
  { id: '40', nTk: '40', serie: 'SIN DATOS', tara: '827', ingreso: 'SIN DATOS', egreso: '7/10/2023', eliminado: false },
  { id: '41', nTk: '41', serie: 'IS 201', tara: '814', ingreso: '19/12/2022', egreso: '7/10/2023', eliminado: false },
  { id: '42', nTk: '42', serie: '8', tara: '800', ingreso: '19/12/2022', egreso: '7/4/2024', eliminado: false },
  { id: '43', nTk: '43', serie: 'A 4', tara: '815', ingreso: '19/12/2022', egreso: '7/4/2024', eliminado: false },
  { id: '44', nTk: '44', serie: 'IQS A 179', tara: '828', ingreso: '7/10/2023', egreso: '7/4/2024', eliminado: false },
  { id: '45', nTk: '45', serie: 'IQS 120', tara: '855', ingreso: '7/10/2023', egreso: '7/4/2024', eliminado: false },
  { id: '46', nTk: '46', serie: 'IQS 237', tara: '764', ingreso: '7/10/2023', egreso: '3/10/2024', eliminado: false },
  { id: '47', nTk: '47', serie: 'IS 115', tara: '767', ingreso: '7/10/2023', egreso: '3/10/2024', eliminado: false },
  { id: '48', nTk: '48', serie: '48428', tara: '676', ingreso: '7/4/2024', egreso: '20/3/2025', eliminado: false },
  { id: '49', nTk: '49', serie: 'IS 208', tara: '818', ingreso: '7/4/2024', egreso: '21/10/2025', eliminado: false },
  { id: '50', nTk: '50', serie: 'IF 135', tara: '820', ingreso: '7/4/2024', egreso: '20/3/2025', eliminado: false },
  { id: '51', nTk: '51', serie: 'IQS 135', tara: '815', ingreso: '7/4/2024', egreso: '3/10/2024', eliminado: false },
  { id: '52', nTk: '52', serie: '703', tara: '796', ingreso: '3/10/2024', egreso: '21/10/2025', eliminado: false },
  { id: '53', nTk: '53', serie: 'A 170', tara: '827', ingreso: '3/10/2024', egreso: '21/10/2025', eliminado: false },
  { id: '54', nTk: '54', serie: 'IQ 132', tara: '830', ingreso: '3/10/2024', egreso: '11/1/2026', eliminado: false },
  { id: '55', nTk: '55', serie: 'A 09', tara: '830', ingreso: '3/10/2024', egreso: '20/3/2025', eliminado: false },
  { id: '56', nTk: '56', serie: 'A 4', tara: '815', ingreso: '20/3/2025', egreso: '27/2/2026', eliminado: false },
  { id: '57', nTk: '57', serie: 'A 259', tara: '814', ingreso: '20/3/2025', egreso: '21/10/2025', eliminado: false },
  { id: '58', nTk: '58', serie: 'IS 109', tara: '768', ingreso: '21/10/2025', egreso: '1/6/2026', eliminado: false },
  { id: '59', nTk: '59', serie: '703', tara: '796', ingreso: '11/1/2026', egreso: '1/6/2026', eliminado: false },
  { id: '60', nTk: '60', serie: 'IF 69', tara: '790', ingreso: '27/2/2026', egreso: '', eliminado: false },
  { id: '61', nTk: '61', serie: 'IF 96', tara: '825', ingreso: '27/2/2026', egreso: '', eliminado: false },
  { id: '62', nTk: '62', serie: 'IS 201', tara: '814', ingreso: '27/2/2026', egreso: '', eliminado: false },
  { id: '63', nTk: '63', serie: '02 IQS', tara: '815', ingreso: '27/2/2026', egreso: '', eliminado: false },
  { id: '64', nTk: '64', serie: 'A 092', tara: '830', ingreso: '1/6/2026', egreso: '', eliminado: false },
  { id: '65', nTk: '65', serie: '', tara: '', ingreso: '', egreso: '', eliminado: false },
  { id: '66', nTk: '66', serie: '', tara: '', ingreso: '', egreso: '', eliminado: false },
];

export default function SeguimientoTanquesPage() {
  const { esGestorGeneral } = useOperador();
  const [tanques, setTanques] = useState<Tanque[]>(initialTanquesData);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const guardados = localStorage.getItem('tanques_gas_cloro_data');
    if (guardados) {
      try {
        setTanques(JSON.parse(guardados));
      } catch (e) {
        console.error('Error al cargar tanques de localStorage:', e);
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
  const [activeDateInputId, setActiveDateInputId] = useState<string | null>(null);

  // FILTRADO DE TANQUES NO ELIMINADOS
  const tanquesVisibles = tanques.filter((t) => !t.eliminado);

  const getFechaHoy = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  const buscarTaraSugerida = (serieIngresada: string, currentId?: string) => {
    const serieLimpia = serieIngresada.trim().toLowerCase();
    if (!serieLimpia || serieLimpia === 'sin datos') return null;

    const encontrado = tanquesVisibles.find(
      (t) =>
        t.id !== currentId &&
        t.serie.trim().toLowerCase() === serieLimpia &&
        t.tara.trim() !== '' &&
        t.tara.trim().toLowerCase() !== 'sin datos'
    );
    return encontrado ? encontrado.tara : null;
  };

  // Crear directamente una nueva fila vacía abajo al hacer clic
  const handleCrearFilaVacia = () => {
    const nuevoId = Date.now().toString();
    const nuevaFila: Tanque = {
      id: nuevoId,
      nTk: proximoNTk(),
      serie: '',
      tara: '',
      ingreso: '',
      egreso: '',
      eliminado: false,
    };

    setTanques((prev) => [...prev, nuevaFila]);
    setEditingId(nuevoId); // Activa la edición en la nueva fila automáticamente
  };

  // BORRADO SUAVE (RESTRINGIDO A GESTOR GENERAL)
  const handleEliminar = (id: string) => {
    if (!esGestorGeneral) {
      alert('Solo el Gestor General tiene permisos para mover registros a Datos Borrados.');
      return;
    }

    const confirmar = window.confirm('¿Deseas mover este tanque a Datos Borrados?');
    if (!confirmar) return;

    setTanques((prev) =>
      prev.map((item) => (item.id === id ? { ...item, eliminado: true } : item))
    );
  };

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
          <TableHead className="w-16 bg-blue-50 text-center p-1">ACCIONES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataSlice.map((row) => {
          const isEditing = editingId === row.id;
          const estiloReingreso = estaFilaCompletada(row) ? getEstilosTanque(row.serie) : null;
          const estaValidoEnPlanta = estaFilaCompletada(row) && (!row.egreso || row.egreso.trim() === '');
          const taraSugeridaFila = isEditing ? buscarTaraSugerida(row.serie, row.id) : null;

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
                    placeholder="Serie..."
                    value={row.serie}
                    onChange={(e) => handleCellChange(row.id, 'serie', e.target.value)}
                    className="w-full text-center font-bold bg-white border border-blue-400 rounded p-0.5 text-xs shadow-inner"
                  />
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <span>{row.serie || '-'}</span>
                    {estiloReingreso && (
                      <span className={`${estiloReingreso.badgeBg} ${estiloReingreso.badgeText} text-[9px] px-1 py-0.2 rounded font-extrabold flex items-center gap-0.5 shadow-sm`}>
                        <Repeat className="w-2.5 h-2.5" /> REINGRESO
                      </span>
                    )}
                  </div>
                )}
              </TableCell>

              {/* TARA */}
              <TableCell className="p-0.5 border-r font-mono text-slate-700 relative">
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tara..."
                      value={row.tara}
                      onChange={(e) => handleCellChange(row.id, 'tara', e.target.value)}
                      className="w-full text-center font-mono bg-white border border-blue-400 rounded p-0.5 text-xs shadow-inner"
                    />
                    {taraSugeridaFila && row.tara !== taraSugeridaFila && (
                      <button
                        type="button"
                        onMouseDown={() => handleCellChange(row.id, 'tara', taraSugeridaFila)}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] px-2 py-0.5 rounded shadow z-30 flex items-center gap-1 whitespace-nowrap font-bold"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-emerald-200" /> Usar Tara ({taraSugeridaFila})
                      </button>
                    )}
                  </div>
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
                      placeholder="dd/mm/aaaa"
                      value={row.ingreso}
                      onFocus={() => setActiveDateInputId(`${row.id}-ingreso`)}
                      onBlur={() => setTimeout(() => setActiveDateInputId(null), 200)}
                      onChange={(e) => handleCellChange(row.id, 'ingreso', e.target.value)}
                      className="w-full text-center font-mono bg-white border border-blue-400 rounded p-0.5 text-xs shadow-inner"
                    />
                    {activeDateInputId === `${row.id}-ingreso` && (
                      <button
                        type="button"
                        onMouseDown={() => handleCellChange(row.id, 'ingreso', getFechaHoy())}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-800 text-white text-[9px] px-2 py-0.5 rounded shadow-md z-30 flex items-center gap-1 whitespace-nowrap hover:bg-emerald-700"
                      >
                        <Calendar className="w-2.5 h-2.5 text-emerald-200" /> Hoy ({getFechaHoy()})
                      </button>
                    )}
                  </div>
                ) : (
                  <span>{row.ingreso || '-'}</span>
                )}
              </TableCell>

              {/* EGRESO / ESTADO */}
              <TableCell className="p-0.5 border-r font-mono text-slate-700 relative">
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd/mm/aaaa"
                      value={row.egreso}
                      onFocus={() => setActiveDateInputId(`${row.id}-egreso`)}
                      onBlur={() => setTimeout(() => setActiveDateInputId(null), 200)}
                      onChange={(e) => handleCellChange(row.id, 'egreso', e.target.value)}
                      className="w-full text-center font-mono bg-white border border-blue-400 rounded p-0.5 text-xs shadow-inner"
                    />
                    {activeDateInputId === `${row.id}-egreso` && (
                      <button
                        type="button"
                        onMouseDown={() => handleCellChange(row.id, 'egreso', getFechaHoy())}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-800 text-white text-[9px] px-2 py-0.5 rounded shadow-md z-30 flex items-center gap-1 whitespace-nowrap hover:bg-emerald-700"
                      >
                        <Calendar className="w-2.5 h-2.5 text-emerald-200" /> Hoy ({getFechaHoy()})
                      </button>
                    )}
                  </div>
                ) : (
                  <span>
                    {row.egreso ? (
                      row.egreso
                    ) : estaValidoEnPlanta ? (
                      <span className="text-emerald-900 font-bold text-[10px] bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
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
                      className="text-emerald-700 hover:text-emerald-900 p-1"
                      title="Guardar cambios"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingId(row.id)}
                      className="text-slate-400 hover:text-emerald-800 p-1"
                      title="Editar registro"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* EL BOTÓN BORRAR SOLO SE MUESTRA SI ES GESTOR GENERAL */}
                  {esGestorGeneral && (
                    <button
                      type="button"
                      onClick={() => handleEliminar(row.id)}
                      className="text-slate-300 hover:text-red-600 transition-colors p-1"
                      title="Mover a Datos Borrados"
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
    <div className="w-full min-h-screen bg-slate-100 p-4 md:p-6 space-y-4 text-xs text-slate-800">
      
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

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border w-full sm:w-auto">
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
        </CardHeader>
      </Card>

      {/* SECCIÓN PRINCIPAL */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-4 items-start">
        
        {/* COLUMNA IZQUIERDA Y CENTRAL: PLANILLA PRINCIPAL */}
        <Card className="xl:col-span-3 shadow-sm border border-slate-200 bg-white overflow-hidden">
          <CardHeader className="bg-[#143823] text-white p-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wide text-white">
                Registro de Tanques ({sortedTanques.length} Tanques Registrados)
              </CardTitle>
              <CardDescription className="text-[11px] text-emerald-200">
                Control e inventario histórico de tanques de gas cloro
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-900/80 text-emerald-100 text-[10px] px-2 py-0.5 rounded font-medium border border-emerald-700">
                En Planta Activos: {tanquesActivosEnPlanta.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-x-auto">
              <div>{renderTable(colIzquierda)}</div>
              <div>{renderTable(colDerecha)}</div>
            </div>

            {/* PIE DE LA PLANILLA: BOTÓN PARA AGREGAR NUEVO TANQUE ABAJO DEL TODO */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Al hacer clic se creará la nueva fila <strong className="text-slate-800">N° {proximoNTk()}</strong> para editar directamente en la planilla.
              </span>
              <Button
                type="button"
                onClick={handleCrearFilaVacia}
                size="sm"
                className="h-8 text-xs bg-[#143823] hover:bg-emerald-900 text-white font-bold px-4 gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar N° {proximoNTk()}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA DERECHA: PANEL LATERAL VERDE OSCURO */}
        <Card className="xl:col-span-1 shadow-sm border border-emerald-800 bg-white overflow-hidden">
          <CardHeader className="bg-[#143823] text-white p-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-300">
              <Repeat className="w-4 h-4 text-emerald-300" />
              Reingresos en Planta
            </CardTitle>
            <CardDescription className="text-[10px] text-emerald-100/80">
              Tanques actualmente activos que ya estuvieron antes en el historial
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
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
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${colorConfig.bgHeader} transition-all shadow-xs`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border shadow-xs flex-shrink-0"
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
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black ${colorConfig.badgeBg} ${colorConfig.badgeText} shadow-xs`}>
                        <History className="w-2.5 h-2.5" />
                        {info.totalApariciones} veces
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}