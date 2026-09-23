'use client';

import React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useOperador } from '@/context/operador-context';

const navItems = [
  { href: '/', label: 'Cargar Datos' },
  { href: '/historial', label: 'Historial' },
  { href: '/guia-dosificacion', label: 'Guía Dosificación' },
  { href: '/guia-parshall', label: 'Guía Parshall' },
];

export function Header() {
  const pathname = usePathname();
  const { operadorActual, horaActualSistema, abrirModalOperador } = useOperador();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="flex h-12 items-center px-3 gap-3">

        {/* LOGO Y TÍTULO (IZQUIERDA) */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.jpg" alt="SPSE Logo" width={36} height={36} priority />
          <span className="text-sm font-bold text-primary hidden md:block">Planta Potabilizadora CALAFATE</span>
        </Link>

        {/* NAVEGACIÓN ESCRITORIO (CENTRADA) */}
        <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-foreground/60'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* FICHA OPERADOR + RELOJ (DERECHA) */}
        <div
          onClick={() => abrirModalOperador()}
          className="flex items-center gap-2 border border-sky-300 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-lg cursor-pointer transition-all shrink-0 ml-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
              {operadorActual}
              <span className="text-sky-500 font-normal ml-1 text-[10px]">(Editar)</span>
            </span>
            <div className="flex items-center text-[10px]">
              <span className="font-mono text-emerald-600 font-extrabold text-xs">{horaActualSistema}</span>
            </div>
          </div>
        </div>

        {/* MENÚ MÓVIL */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-6 p-4">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="/logo.jpg" alt="SPSE Logo" width={48} height={48} />
                  <span className="text-base font-bold text-primary">Planta Potabilizadora CALAFATE</span>
                </Link>
                <nav className="grid gap-3 mt-2">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'text-sm font-medium transition-colors hover:text-primary',
                          pathname === item.href ? 'text-primary font-bold' : 'text-muted-foreground'
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}