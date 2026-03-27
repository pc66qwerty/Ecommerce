"use client";

import { Component, ReactNode } from 'react';
import Link from 'next/link';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
          <p className="text-6xl mb-4">⚠️</p>
          <h1 className="text-xl font-black text-gray-900 mb-2">Algo salió mal</h1>
          <p className="text-gray-500 font-medium mb-8 max-w-xs">
            Ocurrió un error inesperado. Por favor recarga la página.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="bg-[#ff5000] text-white font-black px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              Recargar
            </button>
            <Link href="/" className="bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-full hover:border-gray-300 transition-colors">
              Ir al inicio
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
