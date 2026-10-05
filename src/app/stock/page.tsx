'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RegistroHistorialPlanilla {
  id: string;
  fecha: string;
  parametros?: Record<string, Record<string, string>>;
}

interface TanqueGasCloro {
  id: string;
  tanqueNo: string;
  pesoTotal: string;
  pesoTara: string;
  fechaIngreso: string;
  fechaES: string;
  estado: 'EN_USO' | 'EN_ESPERA';
  posicion: 'BALANZA_1' | 'BALANZA_2' | 'EN_DEPOSITO' | 'FUERA_PLANTA';
}

interface RegistroStockDiario {
  fecha: string;
  tanques?: TanqueGasCloro[];
  pacPrincipio: string;
  pacEntrada: string;
  pacSalida: string;
  pacDestino: string;
  sodaPrincipio: string;
  sodaEntrada: string;
  sodaSalida: string;
  sodaDestino: string;
  ultimaModificacion?: string;
}

// CONVERTIDOR ROBUSTO DE NÚMEROS
const parseVal = (val: string | undefined | number): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let s = val.toString().trim();
  
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }

  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
};

// HOMOLOGADOR UNIVERSAL DE FECHAS (YYYY-MM-DD)
const normalizarFecha = (f: string | undefined): string => {
  if (!f) return '';
  const clean = f.trim().split('T')[0];
  if (clean.includes('/')) {
    const partes = clean.split('/');
    if (partes.length === 3) {
      const d = partes[0].padStart(2, '0');
      const m = partes[1].padStart(2, '0');
      let y = partes[2];
      if (y.length === 2) y = `20${y}`;
      return `${y}-${m}-${d}`;
    }
  }
  if (clean.includes('-')) {
    const partes = clean.split('-');
    if (partes.length === 3) {
      if (partes[0].length === 4) {
        return `${partes[0]}-${partes[1].padStart(2, '0')}-${partes[2].padStart(2, '0')}`;
      } else {
        let y = partes[2];
        if (y.length === 2) y = `20${y}`;
        return `${y}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
    }
  }
  return clean;
};

export default function StockPage() {
  const [isMounted, setIsMounted] = useState(false);

  // FECHA Y REGISTRO DIARIO
  const [fecha, setFecha] = useState('');

  // PAC Y SODA
  const [pacPrincipio, setPacPrincipio] = useState('');
  const [pacEntrada, setPacEntrada] = useState('');
  const [pacSalida, setPacSalida] = useState('');
  const [pacDestino, setPacDestino] = useState('');

  const [sodaPrincipio, setSodaPrincipio] = useState('');
  const [sodaEntrada, setSodaEntrada] = useState('');
  const [sodaSalida, setSodaSalida] = useState('');
  const [sodaDestino, setSodaDestino] = useState('');

  // ESTADOS MASTER Y DÍA
  const [tanques, setTanques] = useState<TanqueGasCloro[]>([]);
  const [historialPlanillas, setHistorialPlanillas] = useState<RegistroHistorialPlanilla[]>([]);
  const [historialStockMap, setHistorialStockMap] = useState<Record<string, RegistroStockDiario>>({});

  // REFRESCAR HISTORIAL DESDE LOCALSTORAGE
  const actualizarHistorialPlanillas = () => {
    const datosPlanillas = localStorage.getItem('historial_planillas');
    if (datosPlanillas) {
      try {
        setHistorialPlanillas(JSON.parse(datosPlanillas));
      } catch (e) {}
    }
  };

  // CÁLCULO DE CONSUMOS DESDE PLANILLAS DIARIAS
  const consumosDiariosPlanillasMap = useMemo(() => {
    const mapCloroKg: Record<string, number> = {};
    const mapPacLts: Record<string, number> = {};
    const mapSodaKg: Record<string, number> = {};

    historialPlanillas.forEach((plan) => {
      if (!plan.fecha || !plan.parametros) return;

      const fechaNorm = normalizarFecha(plan.fecha);
      let cloroKg = 0;
      let pacLts = 0;
      let sodaKg = 0;

      Object.values(plan.parametros).forEach((p) => {
        const cPpm = parseVal(p.cloro || p.cloroPpm || p.cloroPPM);
        const caudal = parseVal(p.caudal || p.caudalM3 || p.caudal_m3);
        const pMl = parseVal(p.pacMlMin || p.pac || p.pacMl);
        const sMl = parseVal(p.sodaMlMin || p.soda || p.sodaMl);

        if (cPpm > 0 && caudal > 0) {
          cloroKg += (cPpm * caudal * 2) / 1000;
        } else if (p.cloroKg) {
          cloroKg += parseVal(p.cloroKg);
        }

        if (pMl > 0) pacLts += (pMl * 120) / 1000;
        if (sMl > 0) sodaKg += (sMl * 120) / 1000;
      });

      mapCloroKg[fechaNorm] = (mapCloroKg[fechaNorm] || 0) + Math.round(cloroKg * 10) / 10;
      mapPacLts[fechaNorm] = (mapPacLts[fechaNorm] || 0) + Math.round(pacLts * 10) / 10;
      mapSodaKg[fechaNorm] = (mapSodaKg[fechaNorm] || 0) + Math.round(sodaKg * 10) / 10;
    });

    return { mapCloroKg, mapPacLts, mapSodaKg };
  }, [historialPlanillas]);

  // GUARDAR AUTOMÁTICO AL CAMBIAR DE DÍA
  const guardarEstadoActualPrevio = (fechaAguardar: string) => {
    if (!fechaAguardar) return;
    const fechaNorm = normalizarFecha(fechaAguardar);

    const registroHoy: RegistroStockDiario = {
      fecha: fechaNorm,
      tanques: JSON.parse(JSON.stringify(tanques)),
      pacPrincipio,
      pacEntrada,
      pacSalida,
      pacDestino,
      sodaPrincipio,
      sodaEntrada,
      sodaSalida,
      sodaDestino,
      ultimaModificacion: new Date().toISOString(),
    };

    const nuevoMap = { ...historialStockMap, [fechaNorm]: registroHoy };
    setHistorialStockMap(nuevoMap);
    localStorage.setItem('historial_stock_diarios_v8', JSON.stringify(nuevoMap));
    localStorage.setItem('stock_tanques_master_v8', JSON.stringify(tanques));
    return nuevoMap;
  };

  // CARGAR DATOS DE UNA FECHA ESPECÍFICA
  const cargarDatosStockFecha = (fechaSel: string, mapStockActual: Record<string, RegistroStockDiario>) => {
    actualizarHistorialPlanillas();
    const fechaNormSel = normalizarFecha(fechaSel);
    const reg = mapStockActual[fechaNormSel];

    if (reg && reg.tanques && reg.tanques.length > 0) {
      setTanques(reg.tanques);
      setPacPrincipio(reg.pacPrincipio || '');
      setPacEntrada(reg.pacEntrada || '');
      setPacSalida(reg.pacSalida || '');
      setPacDestino(reg.pacDestino || '');
      setSodaPrincipio(reg.sodaPrincipio || '');
      setSodaEntrada(reg.sodaEntrada || '');
      setSodaSalida(reg.sodaSalida || '');
      setSodaDestino(reg.sodaDestino || '');
    } else {
      const fechasPrevias = Object.keys(mapStockActual)
        .map((f) => normalizarFecha(f))
        .filter((f) => f < fechaNormSel)
        .sort();

      if (fechasPrevias.length > 0) {
        const ultimaFechaPrev = fechasPrevias[fechasPrevias.length - 1];
        const regAnt = mapStockActual[ultimaFechaPrev];
        const consumoCloroAnt = consumosDiariosPlanillasMap.mapCloroKg[ultimaFechaPrev] || 0;

        if (regAnt && regAnt.tanques && regAnt.tanques.length > 0) {
          const tanquesEncadenados = regAnt.tanques.map((tAnt) => {
            const pTot = parseVal(tAnt.pesoTotal);
            const pTara = parseVal(tAnt.pesoTara);
            const netoInicialAnt = Math.max(0, pTot - pTara);

            const esEnUsoAnt = tAnt.estado === 'EN_USO';
            const consumoImputadoAnt = esEnUsoAnt ? consumoCloroAnt : 0;
            const netoRestanteAnt = Math.max(0, netoInicialAnt - consumoImputadoAnt);

            const nuevoPesoTotal = esEnUsoAnt
              ? Math.round((pTara + netoRestanteAnt) * 10) / 10
              : pTot;

            return {
              ...tAnt,
              pesoTotal: nuevoPesoTotal > 0 ? nuevoPesoTotal.toString() : tAnt.pesoTara,
              estado: tAnt.estado,
              posicion: tAnt.posicion,
            };
          });

          setTanques(tanquesEncadenados);
        }

        if (regAnt) {
          const pacFin = parseVal(regAnt.pacPrincipio) + parseVal(regAnt.pacEntrada) - parseVal(regAnt.pacSalida) - (consumosDiariosPlanillasMap.mapPacLts[ultimaFechaPrev] || 0);
          const sodaFin = parseVal(regAnt.sodaPrincipio) + parseVal(regAnt.sodaEntrada) - parseVal(regAnt.sodaSalida) - (consumosDiariosPlanillasMap.mapSodaKg[ultimaFechaPrev] || 0);

          setPacPrincipio(pacFin > 0 ? pacFin.toString() : '');
          setSodaPrincipio(sodaFin > 0 ? sodaFin.toString() : '');
        }
      } else {
        const datosMaster = localStorage.getItem('stock_tanques_master_v8');
        if (datosMaster) {
          try {
            setTanques(JSON.parse(datosMaster));
          } catch (e) {
            setTanques(createTanqueInicial());
          }
        } else {
          setTanques(createTanqueInicial());
        }
      }

      setPacEntrada('');
      setPacSalida('');
      setPacDestino('');
      setSodaEntrada('');
      setSodaSalida('');
      setSodaDestino('');
    }
  };

  useEffect(() => {
    setIsMounted(true);

    const hoy = new Date();
    const a = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    const fechaHoy = `${a}-${m}-${d}`;
    setFecha(fechaHoy);

    actualizarHistorialPlanillas();

    const datosStock = localStorage.getItem('historial_stock_diarios_v8');
    let mapStock: Record<string, RegistroStockDiario> = {};
    if (datosStock) {
      try {
        mapStock = JSON.parse(datosStock);
        setHistorialStockMap(mapStock);
      } catch (e) {}
    }

    cargarDatosStockFecha(fechaHoy, mapStock);

    const autoRefresh = () => actualizarHistorialPlanillas();
    window.addEventListener('focus', autoRefresh);
    window.addEventListener('storage', autoRefresh);

    return () => {
      window.removeEventListener('focus', autoRefresh);
      window.removeEventListener('storage', autoRefresh);
    };
  }, []);

  const createTanqueInicial = (): TanqueGasCloro[] => [
    {
      id: '1',
      tanqueNo: '10',
      pesoTotal: '130',
      pesoTara: '60',
      fechaIngreso: '',
      fechaES: '',
      estado: 'EN_USO',
      posicion: 'BALANZA_1',
    },
  ];

  const handleFechaChange = (nuevaFecha: string) => {
    const mapaActualizado = guardarEstadoActualPrevio(fecha);
    setFecha(nuevaFecha);
    cargarDatosStockFecha(nuevaFecha, mapaActualizado || historialStockMap);
  };

  // ACCIÓN DE GUARDADO COMPLETO
  const guardarDatosDia = () => {
    if (!fecha) return;
    const fechaNorm = normalizarFecha(fecha);
    const nuevoMap = guardarEstadoActualPrevio(fecha);

    if (nuevoMap) {
      localStorage.setItem('stock_tanques_master_v8', JSON.stringify(tanques));
    }

    alert(`¡Planilla de stock para el día ${fechaNorm} guardada correctamente!`);
  };

  // CAMBIOS EN TANQUES CON OPCIÓN "EN USO" ÚNICA
  const handleTanqueChange = (index: number, campo: keyof TanqueGasCloro, valor: any) => {
    let nuevosTanques = [...tanques];

    if (campo === 'estado' && valor === 'EN_USO') {
      nuevosTanques = nuevosTanques.map((t, i) => {
        if (i === index) {
          let pos = t.posicion;
          if (pos !== 'BALANZA_1' && pos !== 'BALANZA_2') {
            pos = 'BALANZA_1';
          }
          return { ...t, estado: 'EN_USO' as const, posicion: pos };
        } else {
          return { ...t, estado: 'EN_ESPERA' as const };
        }
      });
    } else {
      let tanqueActualizado = { ...nuevosTanques[index], [campo]: valor };

      if (campo === 'posicion' && (valor === 'EN_DEPOSITO' || valor === 'FUERA_PLANTA')) {
        if (tanqueActualizado.estado === 'EN_USO') {
          tanqueActualizado.estado = 'EN_ESPERA';
        }
      }

      nuevosTanques[index] = tanqueActualizado;
    }

    setTanques(nuevosTanques);
    localStorage.setItem('stock_tanques_master_v8', JSON.stringify(nuevosTanques));
  };

  const agregarTanque = () => {
    const nuevos = [
      ...tanques,
      {
        id: Date.now().toString(),
        tanqueNo: '',
        pesoTotal: '130',
        pesoTara: '60',
        fechaIngreso: '',
        fechaES: '',
        estado: 'EN_ESPERA' as const,
        posicion: 'EN_DEPOSITO' as const,
      },
    ];
    setTanques(nuevos);
    localStorage.setItem('stock_tanques_master_v8', JSON.stringify(nuevos));
  };

  const eliminarTanque = (id: string) => {
    if (tanques.length <= 1) return;
    const nuevos = tanques.filter((t) => t.id !== id);
    setTanques(nuevos);
    localStorage.setItem('stock_tanques_master_v8', JSON.stringify(nuevos));
  };

  const fechaNormSel = normalizarFecha(fecha);
  const consumoPacHoy = consumosDiariosPlanillasMap.mapPacLts[fechaNormSel] || 0;
  const consumoSodaHoy = consumosDiariosPlanillasMap.mapSodaKg[fechaNormSel] || 0;
  const consumoCloroHoy = consumosDiariosPlanillasMap.mapCloroKg[fechaNormSel] || 0;

  if (!isMounted) return null;

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4 md:p-6 space-y-6 text-xs text-slate-800 pb-12">
      
      {/* ENCABEZADO Y SELECTOR DE FECHA */}
      <Card className="w-full max-w-7xl mx-auto shadow-sm border-2 border-slate-300 bg-white">
        <CardHeader className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-extrabold text-slate-900">
              Movimiento diario de productos químicos
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Control de stock diario e inventario de insumos de la Planta Potabilizadora.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-300">
            <label className="font-bold text-slate-700 text-xs">Fecha Día:</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => handleFechaChange(e.target.value)}
              className="h-8 text-xs font-bold bg-white border border-slate-300 rounded px-2 outline-none cursor-pointer"
            />
          </div>
        </CardHeader>
      </Card>

      {/* CUADRO 1: PRODUCTOS QUÍMICOS (PAC Y SODA) */}
      <Card className="w-full max-w-7xl mx-auto shadow-sm border-2 border-slate-400 bg-white overflow-hidden">
        <CardHeader className="bg-blue-900 text-white p-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-white">
              1. Productos Químicos (PAC y SODA) — {fecha}
            </CardTitle>
            <CardDescription className="text-[11px] text-blue-200">
              Consumos diarios calculados automáticamente desde las planillas del día.
            </CardDescription>
          </div>
          <span className="bg-blue-800 text-blue-100 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-700">
            PAC / SODA
          </span>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table className="w-full text-center text-xs border-collapse">
            <TableHeader className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
              <TableRow>
                <TableHead className="font-black text-slate-900 bg-slate-300 border-r border-slate-400 w-48 text-center">
                  Producto químico
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center">
                  Principio de mes
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center">
                  Entrada
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center">
                  Salida
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center w-48">
                  Destino
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center bg-amber-100/70 text-amber-950">
                  Consumo del día
                </TableHead>
                <TableHead className="font-black bg-blue-100 text-blue-950 text-center w-36">
                  Final de mes
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              
              {/* FILA PAC */}
              <TableRow className="border-b border-slate-300 hover:bg-slate-50 transition-colors">
                <TableCell className="font-black border-r border-slate-300 bg-slate-100 text-slate-800 text-left px-3">
                  PAC (lts)
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300">
                  <Input
                    type="text"
                    placeholder="0"
                    value={pacPrincipio}
                    onChange={(e) => setPacPrincipio(e.target.value)}
                    className="h-7 text-center text-xs border-none shadow-none font-medium"
                  />
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300 bg-emerald-50/40">
                  <Input
                    type="text"
                    placeholder="0"
                    value={pacEntrada}
                    onChange={(e) => setPacEntrada(e.target.value)}
                    className="h-7 text-center text-xs border-none shadow-none text-emerald-950 font-bold"
                  />
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300 bg-rose-50/40">
                  <Input
                    type="text"
                    placeholder="0"
                    value={pacSalida}
                    onChange={(e) => setPacSalida(e.target.value)}
                    className="h-7 text-center text-xs border-none shadow-none text-rose-950 font-bold"
                  />
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300">
                  <Input
                    type="text"
                    placeholder="Ej. Planta Potabilizadora"
                    value={pacDestino}
                    onChange={(e) => setPacDestino(e.target.value)}
                    className="h-7 text-center text-xs border-none shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300 bg-amber-50/60 font-bold font-mono text-amber-950">
                  {consumoPacHoy} lts
                </TableCell>
                <TableCell className="p-1 bg-blue-100/80 font-black text-blue-950 text-sm font-mono border-l border-slate-300">
                  {(parseVal(pacPrincipio) + parseVal(pacEntrada) - parseVal(pacSalida) - consumoPacHoy).toLocaleString('es-AR')}
                </TableCell>
              </TableRow>

              {/* FILA SODA */}
              <TableRow className="border-b border-slate-300 hover:bg-slate-50 transition-colors">
                <TableCell className="font-black border-r border-slate-300 bg-slate-100 text-slate-800 text-left px-3">
                  SODA (kg)
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300">
                  <Input
                    type="text"
                    placeholder="0"
                    value={sodaPrincipio}
                    onChange={(e) => setSodaPrincipio(e.target.value)}
                    className="h-7 text-center text-xs border-none shadow-none font-medium"
                  />
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300 bg-emerald-50/40">
                  <Input
                    type="text"
                    placeholder="0"
                    value={sodaEntrada}
                    onChange={(e) => setSodaEntrada(e.target.value)}
                    className="h-7 text-center text-xs border-none shadow-none text-emerald-950 font-bold"
                  />
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300 bg-rose-50/40">
                  <Input
                    type="text"
                    placeholder="0"
                    value={sodaSalida}
                    onChange={(e) => setSodaSalida(e.target.value)}
                    className="h-7 text-center text-xs border-none shadow-none text-rose-950 font-bold"
                  />
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300">
                  <Input
                    type="text"
                    placeholder="Ej. Planta Potabilizadora"
                    value={sodaDestino}
                    onChange={(e) => setSodaDestino(e.target.value)}
                    className="h-7 text-center text-xs border-none shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1 border-r border-slate-300 bg-amber-50/60 font-bold font-mono text-amber-950">
                  {consumoSodaHoy} kg
                </TableCell>
                <TableCell className="p-1 bg-blue-100/80 font-black text-blue-950 text-sm font-mono border-l border-slate-300">
                  {(parseVal(sodaPrincipio) + parseVal(sodaEntrada) - parseVal(sodaSalida) - consumoSodaHoy).toLocaleString('es-AR')}
                </TableCell>
              </TableRow>

            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CUADRO 2: STOCK TANQUES GAS CLORO */}
      <Card className="w-full max-w-7xl mx-auto shadow-sm border-2 border-slate-400 bg-white overflow-hidden">
        <CardHeader className="bg-emerald-900 text-white p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-white">
              2. Stock Tanques GAS CLORO — Estado al {fecha}
            </CardTitle>
            <CardDescription className="text-[11px] text-emerald-200">
              Consumo registrado en Cargar Datos para el día {fecha}: <strong className="text-amber-300 text-xs">{consumoCloroHoy} kg</strong>
            </CardDescription>
          </div>
          <Button
            onClick={agregarTanque}
            size="sm"
            className="h-7 text-xs bg-emerald-800 hover:bg-emerald-700 text-white font-bold border border-emerald-600"
          >
            + Agregar Tanque
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table className="w-full text-center text-xs border-collapse">
            <TableHeader className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
              <TableRow>
                <TableHead className="font-bold border-r border-slate-400 text-center w-24">
                  Tanque N°
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center">
                  Peso Total (kg)
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center">
                  Peso Tara (kg)
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center text-amber-950 bg-amber-100/70">
                  Consumo del día (kg)
                </TableHead>
                <TableHead className="font-black bg-blue-100 text-blue-950 text-center w-36 border-r border-slate-400">
                  Peso Neto Restante (kg)
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center">
                  Fecha Ingreso
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center">
                  Fecha E/S
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center w-36">
                  Posición
                </TableHead>
                <TableHead className="font-bold border-r border-slate-400 text-center w-32">
                  Estado
                </TableHead>
                <TableHead className="font-bold text-center w-20">
                  Acción
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tanques.map((tanque, index) => {
                const pTotal = parseVal(tanque.pesoTotal);
                const pTara = parseVal(tanque.pesoTara);
                const netoInicial = Math.max(0, pTotal - pTara);

                const esEnUso = tanque.estado === 'EN_USO';
                const consumoDia = esEnUso ? consumoCloroHoy : 0;
                const netoRestante = Math.max(0, netoInicial - consumoDia);

                return (
                  <TableRow
                    key={tanque.id}
                    className={`border-b border-slate-300 transition-colors ${
                      esEnUso ? 'bg-emerald-100/90 font-semibold text-emerald-950' : 'hover:bg-slate-50'
                    }`}
                  >
                    
                    {/* 1. TANQUE N° */}
                    <TableCell className="p-1 border-r border-slate-300">
                      <Input
                        type="text"
                        placeholder="N°"
                        value={tanque.tanqueNo}
                        onChange={(e) => handleTanqueChange(index, 'tanqueNo', e.target.value)}
                        className="h-7 text-center text-xs border-none shadow-none font-bold text-slate-900 bg-transparent"
                      />
                    </TableCell>

                    {/* 2. PESO TOTAL */}
                    <TableCell className="p-1 border-r border-slate-300">
                      <Input
                        type="text"
                        placeholder="0"
                        value={tanque.pesoTotal}
                        onChange={(e) => handleTanqueChange(index, 'pesoTotal', e.target.value)}
                        className="h-7 text-center text-xs border-none shadow-none font-medium bg-transparent"
                      />
                    </TableCell>

                    {/* 3. PESO TARA */}
                    <TableCell className="p-1 border-r border-slate-300">
                      <Input
                        type="text"
                        placeholder="0"
                        value={tanque.pesoTara}
                        onChange={(e) => handleTanqueChange(index, 'pesoTara', e.target.value)}
                        className="h-7 text-center text-xs border-none shadow-none font-medium bg-transparent"
                      />
                    </TableCell>

                    {/* 4. CONSUMO DEL DÍA */}
                    <TableCell className={`p-1 border-r border-slate-300 font-mono font-bold ${esEnUso ? 'text-amber-900' : 'text-amber-950 bg-amber-50/60'}`}>
                      {consumoDia > 0 ? `${consumoDia.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg` : '-'}
                    </TableCell>

                    {/* 5. PESO NETO RESTANTE */}
                    <TableCell className={`p-1 font-black text-blue-950 text-sm font-mono border-r border-slate-300 ${esEnUso ? 'bg-emerald-200/60' : 'bg-blue-100/90'}`}>
                      {netoRestante.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg
                    </TableCell>

                    {/* 6. FECHA INGRESO */}
                    <TableCell className="p-1 border-r border-slate-300">
                      <Input
                        type="date"
                        value={tanque.fechaIngreso}
                        onChange={(e) => handleTanqueChange(index, 'fechaIngreso', e.target.value)}
                        className="h-7 text-center text-xs border-none shadow-none bg-transparent"
                      />
                    </TableCell>

                    {/* 7. FECHA E/S */}
                    <TableCell className="p-1 border-r border-slate-300">
                      <Input
                        type="date"
                        value={tanque.fechaES}
                        onChange={(e) => handleTanqueChange(index, 'fechaES', e.target.value)}
                        className="h-7 text-center text-xs border-none shadow-none bg-transparent"
                      />
                    </TableCell>

                    {/* 8. POSICIÓN */}
                    <TableCell className="p-1 border-r border-slate-300">
                      <select
                        value={tanque.posicion}
                        onChange={(e) => handleTanqueChange(index, 'posicion', e.target.value)}
                        className={`h-7 w-full text-center text-xs border rounded font-bold outline-none cursor-pointer ${
                          esEnUso ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      >
                        <option value="BALANZA_1">Balanza 1</option>
                        <option value="BALANZA_2">Balanza 2</option>
                        {!esEnUso && (
                          <>
                            <option value="EN_DEPOSITO">En Depósito</option>
                            <option value="FUERA_PLANTA">Fuera de planta</option>
                          </>
                        )}
                      </select>
                    </TableCell>

                    {/* 9. ESTADO (EN USO / EN ESPERA) */}
                    <TableCell className="p-1 border-r border-slate-300">
                      <select
                        value={tanque.estado}
                        onChange={(e) => handleTanqueChange(index, 'estado', e.target.value)}
                        className={`h-7 w-full text-center text-xs border rounded font-bold outline-none cursor-pointer ${
                          esEnUso
                            ? 'bg-emerald-600 text-white border-emerald-700 font-extrabold shadow-sm'
                            : 'bg-white text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="EN_USO">⚡ En uso</option>
                        <option value="EN_ESPERA">En espera</option>
                      </select>
                    </TableCell>

                    {/* 10. BORRAR FILA */}
                    <TableCell className="p-1 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarTanque(tanque.id)}
                        className="h-7 px-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Eliminar Tanque"
                      >
                        Borrar
                      </Button>
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* BOTÓN INFERIOR: GUARDAR PLANILLA COMPLETA */}
      <div className="w-full max-w-7xl mx-auto pt-4 flex justify-center">
        <Button
          onClick={guardarDatosDia}
          className="w-full max-w-4xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all"
        >
          Guardar Planilla Completa
        </Button>
      </div>

    </div>
  );
}