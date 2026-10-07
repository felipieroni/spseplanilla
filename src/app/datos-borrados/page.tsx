'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2, ArrowLeft, CheckCircle2, ClipboardList, Boxes, Cylinder, RefreshCw, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useOperador } from '@/context/operador-context';

interface Planilla {
  id: string;
  fecha: string;
  operador?: string;
  eliminado?: boolean;
  parametros?: Record<string, any>;
}

interface TanqueStock {
  id: string;
  tanqueNo: string;
  pesoTotal: string;
  pesoTara: string;
  estado: string;
  posicion: string;
  eliminado?: boolean;
}

interface TanqueRegistro {
  id: string;
  nTk: string;
  serie: string;
  tara: string;
  ingreso: string;
  egreso: string;
  eliminado?: boolean;
}

export default function DatosBorradosPage() {
  const { esGestorGeneral } = useOperador();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'planillas' | 'stock' | 'registro'>('planillas');

  // Listas de items borrados
  const [planillasBorradas, setPlanillasBorradas] = useState<Planilla[]>([]);
  const [stockBorrados, setStockBorrados] = useState<TanqueStock[]>([]);
  const [registroBorrados, setRegistroBorrados] = useState<TanqueRegistro[]>([]);

  // CARGAR TODOS LOS DATOS DESDE LOCALSTORAGE
  const cargarTodosLosBorrados = () => {
    // 1. Historial de Planillas
    const datosPlanillas = localStorage.getItem('historial_planillas');
    if (datosPlanillas) {
      try {
        const lista: Planilla[] = JSON.parse(datosPlanillas);
        setPlanillasBorradas(lista.filter((item) => item.eliminado === true));
      } catch (e) {
        console.error('Error al cargar planillas borradas:', e);
      }
    } else {
      setPlanillasBorradas([]);
    }

    // 2. Stock Tanques Gas Cloro
    const datosStock = localStorage.getItem('stock_tanques_master_v8');
    if (datosStock) {
      try {
        const lista: TanqueStock[] = JSON.parse(datosStock);
        setStockBorrados(lista.filter((item) => item.eliminado === true));
      } catch (e) {
        console.error('Error al cargar stock borrado:', e);
      }
    } else {
      setStockBorrados([]);
    }

    // 3. Registro de Tanques Gas Cloro
    const datosRegistro = localStorage.getItem('tanques_gas_cloro_data');
    if (datosRegistro) {
      try {
        const lista: TanqueRegistro[] = JSON.parse(datosRegistro);
        setRegistroBorrados(lista.filter((item) => item.eliminado === true));
      } catch (e) {
        console.error('Error al cargar registro de tanques borrados:', e);
      }
    } else {
      setRegistroBorrados([]);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    cargarTodosLosBorrados();
  }, []);

  // RESTAURAR PLANILLA
  const handleRestaurarPlanilla = (id: string) => {
    if (!esGestorGeneral) return;
    const raw = localStorage.getItem('historial_planillas');
    if (raw) {
      try {
        const lista: Planilla[] = JSON.parse(raw);
        const actualizados = lista.map((p) => (p.id === id ? { ...p, eliminado: false } : p));
        localStorage.setItem('historial_planillas', JSON.stringify(actualizados));
        cargarTodosLosBorrados();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // RESTAURAR TANQUE STOCK
  const handleRestaurarStock = (id: string) => {
    if (!esGestorGeneral) return;
    const raw = localStorage.getItem('stock_tanques_master_v8');
    if (raw) {
      try {
        const lista: TanqueStock[] = JSON.parse(raw);
        const actualizados = lista.map((s) => (s.id === id ? { ...s, eliminado: false } : s));
        localStorage.setItem('stock_tanques_master_v8', JSON.stringify(actualizados));
        cargarTodosLosBorrados();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // RESTAURAR TANQUE REGISTRO
  const handleRestaurarRegistro = (id: string) => {
    if (!esGestorGeneral) return;
    const raw = localStorage.getItem('tanques_gas_cloro_data');
    if (raw) {
      try {
        const lista: TanqueRegistro[] = JSON.parse(raw);
        const actualizados = lista.map((r) => (r.id === id ? { ...r, eliminado: false } : r));
        localStorage.setItem('tanques_gas_cloro_data', JSON.stringify(actualizados));
        cargarTodosLosBorrados();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // RESTAURAR TODO EN LA PESTAÑA ACTIVA
  const handleRestaurarTodoPestana = () => {
    if (!esGestorGeneral) return;

    if (activeTab === 'planillas') {
      const raw = localStorage.getItem('historial_planillas');
      if (raw) {
        const lista: Planilla[] = JSON.parse(raw);
        const actualizados = lista.map((p) => ({ ...p, eliminado: false }));
        localStorage.setItem('historial_planillas', JSON.stringify(actualizados));
      }
    } else if (activeTab === 'stock') {
      const raw = localStorage.getItem('stock_tanques_master_v8');
      if (raw) {
        const lista: TanqueStock[] = JSON.parse(raw);
        const actualizados = lista.map((s) => ({ ...s, eliminado: false }));
        localStorage.setItem('stock_tanques_master_v8', JSON.stringify(actualizados));
      }
    } else if (activeTab === 'registro') {
      const raw = localStorage.getItem('tanques_gas_cloro_data');
      if (raw) {
        const lista: TanqueRegistro[] = JSON.parse(raw);
        const actualizados = lista.map((r) => ({ ...r, eliminado: false }));
        localStorage.setItem('tanques_gas_cloro_data', JSON.stringify(actualizados));
      }
    }
    cargarTodosLosBorrados();
  };

  if (!isMounted) return null;

  const totalBorradosActuales =
    activeTab === 'planillas'
      ? planillasBorradas.length
      : activeTab === 'stock'
      ? stockBorrados.length
      : registroBorrados.length;

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4 md:p-6 space-y-6 text-xs text-slate-800 pb-12">
      
      {/* ADVERTENCIA SI NO ES GESTOR GENERAL */}
      {!esGestorGeneral && (
        <div className="w-full max-w-7xl mx-auto bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg shadow-sm flex items-center gap-3 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs leading-relaxed">
            <strong>Modo Solo Lectura:</strong> Se encuentra registrado como operador estándar. Únicamente el <strong>Gestor General</strong> (clave: 1234) posee permisos para restaurar datos borrados de la papelera.
          </p>
        </div>
      )}

      {/* ENCABEZADO */}
      <Card className="w-full max-w-7xl mx-auto shadow-sm border bg-white">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 gap-4">
          <div>
            <CardTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-amber-600" />
              Gestor de Datos Borrados
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Papelera centralizada. Todos los registros eliminados se conservan y pueden restaurarse en cualquier momento.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {esGestorGeneral && totalBorradosActuales > 0 && (
              <Button
                onClick={handleRestaurarTodoPestana}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold gap-1 bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                Restaurar Todo en esta sección
              </Button>
            )}

            <Link href="/">
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-1 text-slate-700">
                <ArrowLeft className="w-4 h-4" /> Volver
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="w-full max-w-7xl mx-auto flex flex-wrap gap-2">
        
        {/* PESTAÑA 1: HISTORIAL DE PLANILLAS */}
        <button
          onClick={() => setActiveTab('planillas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border shadow-xs ${
            activeTab === 'planillas'
              ? 'bg-blue-900 text-white border-blue-950 shadow-md'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className={`w-4 h-4 ${activeTab === 'planillas' ? 'text-blue-300' : 'text-slate-500'}`} />
          <span>Historial de Planillas</span>
          <span
            className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
              activeTab === 'planillas' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {planillasBorradas.length}
          </span>
        </button>

        {/* PESTAÑA 2: STOCK TANQUES GAS CLORO */}
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border shadow-xs ${
            activeTab === 'stock'
              ? 'bg-blue-900 text-white border-blue-950 shadow-md'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Boxes className={`w-4 h-4 ${activeTab === 'stock' ? 'text-blue-300' : 'text-slate-500'}`} />
          <span>Stock Tanques GAS CLORO</span>
          <span
            className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
              activeTab === 'stock' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {stockBorrados.length}
          </span>
        </button>

        {/* PESTAÑA 3: REGISTRO DE TANQUES GAS CLORO */}
        <button
          onClick={() => setActiveTab('registro')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border shadow-xs ${
            activeTab === 'registro'
              ? 'bg-blue-900 text-white border-blue-950 shadow-md'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Cylinder className={`w-4 h-4 ${activeTab === 'registro' ? 'text-blue-300' : 'text-slate-500'}`} />
          <span>Registro de Tanques GAS CLORO</span>
          <span
            className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
              activeTab === 'registro' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {registroBorrados.length}
          </span>
        </button>

      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
      <Card className="w-full max-w-7xl mx-auto shadow-sm border border-slate-300 bg-white overflow-hidden">
        
        {/* PESTAÑA 1: PLANILLAS BORRADAS */}
        {activeTab === 'planillas' && (
          <div>
            <CardHeader className="bg-blue-900 text-white p-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wide text-blue-100">
                Planillas Diarias Ocultas / Borradas ({planillasBorradas.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {planillasBorradas.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm">No hay planillas borradas</p>
                  <p className="text-xs text-slate-400">Todas las planillas ingresadas en Cargar Datos están activas.</p>
                </div>
              ) : (
                <Table className="w-full text-center text-xs border-collapse">
                  <TableHeader className="bg-slate-100 border-b">
                    <TableRow>
                      <TableHead className="font-extrabold text-slate-800 border-r text-center p-2">FECHA</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">OPERADOR</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">ID REGISTRO</TableHead>
                      <TableHead className="w-32 text-center p-2">ACCIÓN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planillasBorradas.map((row) => (
                      <TableRow key={row.id} className="border-b hover:bg-slate-50">
                        <TableCell className="p-2 border-r font-black bg-slate-100 text-slate-900">{row.fecha}</TableCell>
                        <TableCell className="p-2 border-r font-bold text-slate-800">{row.operador || 'Sin especificar'}</TableCell>
                        <TableCell className="p-2 border-r font-mono text-slate-500">{row.id}</TableCell>
                        <TableCell className="p-1 text-center">
                          {esGestorGeneral ? (
                            <Button
                              size="sm"
                              onClick={() => handleRestaurarPlanilla(row.id)}
                              className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 rounded"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                            </Button>
                          ) : (
                            <span className="text-slate-400 font-medium italic text-[11px]">
                              Solo Gestor General
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </div>
        )}

        {/* PESTAÑA 2: STOCK TANQUES BORRADOS */}
        {activeTab === 'stock' && (
          <div>
            <CardHeader className="bg-blue-900 text-white p-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wide text-blue-100">
                Tanques de Stock Ocultos / Borrados ({stockBorrados.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {stockBorrados.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm">No hay tanques de stock borrados</p>
                  <p className="text-xs text-slate-400">Todos los tanques configurados en el módulo Stock están activos.</p>
                </div>
              ) : (
                <Table className="w-full text-center text-xs border-collapse">
                  <TableHeader className="bg-slate-100 border-b">
                    <TableRow>
                      <TableHead className="font-extrabold text-slate-800 border-r w-20 text-center p-2">TANQUE N°</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">PESO TOTAL (KG)</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">PESO TARA (KG)</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">ESTADO</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">POSICIÓN</TableHead>
                      <TableHead className="w-32 text-center p-2">ACCIÓN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockBorrados.map((row) => (
                      <TableRow key={row.id} className="border-b hover:bg-slate-50">
                        <TableCell className="p-2 border-r font-black bg-slate-100">{row.tanqueNo || '-'}</TableCell>
                        <TableCell className="p-2 border-r font-mono">{row.pesoTotal || '-'}</TableCell>
                        <TableCell className="p-2 border-r font-mono">{row.pesoTara || '-'}</TableCell>
                        <TableCell className="p-2 border-r font-bold">{row.estado}</TableCell>
                        <TableCell className="p-2 border-r font-medium">{row.posicion}</TableCell>
                        <TableCell className="p-1 text-center">
                          {esGestorGeneral ? (
                            <Button
                              size="sm"
                              onClick={() => handleRestaurarStock(row.id)}
                              className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 rounded"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                            </Button>
                          ) : (
                            <span className="text-slate-400 font-medium italic text-[11px]">
                              Solo Gestor General
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </div>
        )}

        {/* PESTAÑA 3: REGISTRO DE TANQUES BORRADOS */}
        {activeTab === 'registro' && (
          <div>
            <CardHeader className="bg-blue-900 text-white p-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wide text-blue-100">
                Historial de Tanques Gas Cloro Ocultos / Borrados ({registroBorrados.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {registroBorrados.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm">No hay tanques borrados en el registro</p>
                  <p className="text-xs text-slate-400">Todos los tanques de la lista histórica están activos.</p>
                </div>
              ) : (
                <Table className="w-full text-center text-xs border-collapse">
                  <TableHeader className="bg-slate-100 border-b">
                    <TableRow>
                      <TableHead className="font-extrabold text-slate-800 border-r w-16 text-center p-2">N° TK</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">SERIE</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">TARA (KG)</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">INGRESO</TableHead>
                      <TableHead className="font-bold border-r text-center p-2">EGRESO</TableHead>
                      <TableHead className="w-32 text-center p-2">ACCIÓN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registroBorrados.map((row) => (
                      <TableRow key={row.id} className="border-b hover:bg-slate-50">
                        <TableCell className="p-2 border-r font-black bg-slate-100">{row.nTk}</TableCell>
                        <TableCell className="p-2 border-r font-bold">{row.serie || '-'}</TableCell>
                        <TableCell className="p-2 border-r font-mono">{row.tara || '-'}</TableCell>
                        <TableCell className="p-2 border-r font-mono">{row.ingreso || '-'}</TableCell>
                        <TableCell className="p-2 border-r font-mono">{row.egreso || '-'}</TableCell>
                        <TableCell className="p-1 text-center">
                          {esGestorGeneral ? (
                            <Button
                              size="sm"
                              onClick={() => handleRestaurarRegistro(row.id)}
                              className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 rounded"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                            </Button>
                          ) : (
                            <span className="text-slate-400 font-medium italic text-[11px]">
                              Solo Gestor General
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </div>
        )}

      </Card>

    </div>
  );
}