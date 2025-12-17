'use client';

import React from 'react';
import './globals.css';

export const metadata = {
  title: 'GL Strategic - Audio to Web Generator',
  description: 'Convierte audio en sitios web estáticos con transcripción automática',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GL Strategic System</h1>
                <p className="text-sm text-gray-500 mt-1">Audio → Website Generator</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">MVP v0.1.0</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 text-center">
              © 2025 GL Strategic. Desarrollado por SAM v3.0 AI-Teacher.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
