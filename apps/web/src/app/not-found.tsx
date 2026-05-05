import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] w-full text-center space-y-6">
      <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center">
        <FileQuestion size={40} className="text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">404 - No encontrado</h2>
        <p className="text-muted-foreground max-w-[500px] mx-auto">
          La página o módulo que estás buscando no existe o se encuentra en construcción.
        </p>
      </div>

      <Link 
        href="/"
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95"
      >
        Volver al Inicio
      </Link>
    </div>
  );
}
