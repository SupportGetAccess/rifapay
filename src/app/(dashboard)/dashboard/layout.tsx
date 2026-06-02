import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
        <Link href="/" className="text-2xl font-bold text-primary block mb-8">RifaPay</Link>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary">
            Resumen
          </Link>
          <Link href="/dashboard/rifas" className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary">
            Mis rifas
          </Link>
          <Link href="/dashboard/ventas" className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary">
            Ventas
          </Link>
          <Link href="/dashboard/afiliados" className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary">
            Afiliados
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
