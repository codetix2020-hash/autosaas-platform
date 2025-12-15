import Link from "next/link";

export default function ReservasProLanding() {
	return (
		<div className="bg-[#0a0a0a] text-white min-h-screen">
			{/* Hero Section */}
			<section className="relative pt-32 pb-20 px-4 overflow-hidden">
				{/* Background gradient */}
				<div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent" />

				<div className="max-w-4xl mx-auto text-center relative z-10">
					<h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
						El sistema de reservas que{" "}
						<span className="text-[#D4AF37]">tus clientes amarán</span>
					</h1>
					<p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
						Gestiona tu barbería de forma simple. Reservas online, fidelización con XP, y más.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/auth/signup"
							className="px-8 py-4 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#c4a030] transition-colors text-lg"
						>
							Empieza gratis
						</Link>
						<Link
							href="/reservas/codetix"
							className="px-8 py-4 border border-[#D4AF37] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-colors text-lg"
						>
							Ver demo
						</Link>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="px-4 py-20 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-black">
				<div className="container mx-auto max-w-6xl">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
							Todo lo que necesitas en un solo lugar
						</h2>
						<p className="text-gray-400 text-lg">
							Herramientas diseñadas específicamente para barberías y salones de belleza
						</p>
					</div>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 hover:border-[#D4AF37]/50 transition-all">
							<div className="text-5xl mb-4">📅</div>
							<h3 className="text-2xl font-bold mb-3 text-[#D4AF37]">
								Reservas Online 24/7
							</h3>
							<p className="text-gray-400 text-lg">
								Tus clientes reservan cuando quieran, sin llamadas
							</p>
						</div>
						<div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 hover:border-[#D4AF37]/50 transition-all">
							<div className="text-5xl mb-4">🏆</div>
							<h3 className="text-2xl font-bold mb-3 text-[#D4AF37]">
								Sistema de Fidelización
							</h3>
							<p className="text-gray-400 text-lg">
								Puntos XP, niveles y recompensas automáticas
							</p>
						</div>
						<div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 hover:border-[#D4AF37]/50 transition-all">
							<div className="text-5xl mb-4">📊</div>
							<h3 className="text-2xl font-bold mb-3 text-[#D4AF37]">
								Panel de Control
							</h3>
							<p className="text-gray-400 text-lg">
								Gestiona servicios, profesionales y clientes en un solo lugar
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section className="px-4 py-20 md:py-32 bg-black">
				<div className="container mx-auto max-w-6xl">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
							Planes que se adaptan a tu negocio
						</h2>
						<p className="text-gray-400 text-lg">
							Elige el plan perfecto para tu barbería
						</p>
					</div>
					<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
						{/* Plan Básico */}
						<div className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-xl p-8 hover:border-[#D4AF37]/50 transition-all">
							<div className="mb-6">
								<h3 className="text-2xl font-bold mb-2">Básico</h3>
								<div className="flex items-baseline">
									<span className="text-4xl font-bold text-[#D4AF37]">€19</span>
									<span className="text-gray-400 ml-2">/mes</span>
								</div>
							</div>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start">
									<span className="text-[#D4AF37] mr-2">✓</span>
									<span className="text-gray-300">Hasta 100 reservas/mes</span>
								</li>
								<li className="flex items-start">
									<span className="text-[#D4AF37] mr-2">✓</span>
									<span className="text-gray-300">1 profesional</span>
								</li>
								<li className="flex items-start">
									<span className="text-[#D4AF37] mr-2">✓</span>
									<span className="text-gray-300">Soporte email</span>
								</li>
								<li className="flex items-start">
									<span className="text-[#D4AF37] mr-2">✓</span>
									<span className="text-gray-300">Sistema de fidelización</span>
								</li>
							</ul>
							<Link
								href="/auth/signup"
								className="block w-full text-center px-6 py-3 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all"
							>
								Empezar ahora
							</Link>
						</div>

						{/* Plan Pro */}
						<div className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border-2 border-[#D4AF37] rounded-xl p-8 relative hover:border-[#D4AF37] transition-all">
							<div className="absolute top-0 right-0 bg-[#D4AF37] text-[#0a0a0a] px-4 py-1 rounded-bl-lg text-sm font-bold">
								POPULAR
							</div>
							<div className="mb-6 mt-4">
								<h3 className="text-2xl font-bold mb-2">Pro</h3>
								<div className="flex items-baseline">
									<span className="text-4xl font-bold text-[#D4AF37]">€39</span>
									<span className="text-gray-400 ml-2">/mes</span>
								</div>
							</div>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start">
									<span className="text-[#D4AF37] mr-2">✓</span>
									<span className="text-gray-300">Reservas ilimitadas</span>
								</li>
								<li className="flex items-start">
									<span className="text-[#D4AF37] mr-2">✓</span>
									<span className="text-gray-300">Profesionales ilimitados</span>
								</li>
								<li className="flex items-start">
									<span className="text-[#D4AF37] mr-2">✓</span>
									<span className="text-gray-300">Recordatorios automáticos</span>
								</li>
								<li className="flex items-start">
									<span className="text-[#D4AF37] mr-2">✓</span>
									<span className="text-gray-300">Soporte prioritario</span>
								</li>
								<li className="flex items-start">
									<span className="text-[#D4AF37] mr-2">✓</span>
									<span className="text-gray-300">Todo lo del plan Básico</span>
								</li>
							</ul>
							<Link
								href="/auth/signup"
								className="block w-full text-center px-6 py-3 bg-[#D4AF37] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-all transform hover:scale-105"
							>
								Empezar ahora
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="px-4 py-20 md:py-32 bg-gradient-to-b from-black to-[#0a0a0a]">
				<div className="container mx-auto max-w-4xl text-center">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
						¿Listo para modernizar tu barbería?
					</h2>
					<p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
						Únete a las barberías que ya están usando ReservasPro para gestionar sus reservas de forma eficiente.
					</p>
					<Link
						href="/auth/signup"
						className="inline-block px-10 py-5 bg-[#D4AF37] text-[#0a0a0a] font-bold text-lg rounded-lg hover:bg-[#D4AF37]/90 transition-all transform hover:scale-105 shadow-lg shadow-[#D4AF37]/30"
					>
						Crear mi cuenta gratis
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-800 px-4 py-12 bg-[#0a0a0a]">
				<div className="container mx-auto max-w-6xl">
					<div className="flex flex-col md:flex-row justify-between items-center gap-6">
						<div>
							<h3 className="text-2xl font-bold text-[#D4AF37] mb-2">ReservasPro</h3>
							<p className="text-gray-400">El sistema de reservas para barberías</p>
						</div>
						<div className="flex flex-col md:flex-row gap-6 items-center">
							<Link
								href="https://codetix.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
							>
								Hecho con ❤️ por CodeTix
							</Link>
							<div className="flex gap-4">
								<Link
									href="/reservas/codetix"
									className="text-gray-400 hover:text-[#D4AF37] transition-colors"
								>
									Ver demo
								</Link>
								<Link
									href="/auth/signup"
									className="text-gray-400 hover:text-[#D4AF37] transition-colors"
								>
									Registrarse
								</Link>
							</div>
						</div>
					</div>
					<div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
						<p>© {new Date().getFullYear()} ReservasPro. Todos los derechos reservados.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

