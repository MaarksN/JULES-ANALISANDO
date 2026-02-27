import React from 'react';
import * as Icons from 'lucide-react';
import { Helmet } from 'react-helmet-async'; // Item 68: SEO

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-y-auto">
      {/* Item 68: SEO Meta Tags */}
      <Helmet>
        <title>JusArtificial - A IA Jurídica para Advogados de Elite</title>
        <meta name="description" content="Automatize petições, revise contratos e encontre jurisprudência em segundos com a primeira IA jurídica do Brasil focada em alta performance." />
        <meta property="og:title" content="JusArtificial - A IA Jurídica para Advogados de Elite" />
        <meta property="og:description" content="Automatize petições, revise contratos e encontre jurisprudência em segundos." />
        <link rel="canonical" href="https://jusartificial.com.br" />
      </Helmet>

      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-slate-950 z-0"></div>
        <div className="absolute top-0 right-0 p-6 flex space-x-4 z-20">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</button>
            <button onClick={onEnter} className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                Começar Agora
            </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md shadow-lg">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">IA Jurídica Brasileira v2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 font-serif text-white">
            Produtividade Jurídica <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Sem Precedentes</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            A primeira suíte jurídica desenvolvida exclusivamente para o Direito Brasileiro.
            Crie petições, revise contratos e pesquise jurisprudência com a segurança que seu escritório exige.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={onEnter}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-emerald-600 font-serif rounded-xl hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 w-full sm:w-auto"
            >
                Acessar Plataforma
                <Icons.ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 text-lg font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl transition-all w-full sm:w-auto">
                Ver Demonstração
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-slate-500 text-sm font-medium opacity-80">
            <span className="flex items-center"><Icons.Check className="w-4 h-4 mr-2 text-emerald-500"/> Lei 9.099/95 (JEC)</span>
            <span className="flex items-center"><Icons.Check className="w-4 h-4 mr-2 text-emerald-500"/> Código do Consumidor</span>
            <span className="flex items-center"><Icons.Check className="w-4 h-4 mr-2 text-emerald-500"/> Direito Bancário</span>
          </div>
        </div>
      </header>

      {/* Specializations Section (New) */}
      <section className="py-24 bg-slate-900 relative">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-white">Especializações Avançadas</h2>
               <p className="text-slate-400 max-w-2xl mx-auto">
                  Treinada nas nuances do ordenamento jurídico nacional para entregar resultados técnicos e precisos em áreas críticas.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors group">
                  <div className="w-14 h-14 bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-900/50 transition-colors">
                     <Icons.Gavel className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-100">Juizado Especial Cível</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Adequação automática ao rito da Lei 9.099. Linguagem objetiva, pedidos líquidos e foco na celeridade processual.
                  </p>
               </div>

               <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors group">
                  <div className="w-14 h-14 bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-900/50 transition-colors">
                     <Icons.Landmark className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-100">Direito Bancário</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Identificação precisa de juros abusivos, capitalização indevida e tarifas ilegais com base em resoluções do BACEN.
                  </p>
               </div>

               <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors group">
                  <div className="w-14 h-14 bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-900/50 transition-colors">
                     <Icons.Users className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-100">Consumidor & CDC</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Análise profunda de práticas abusivas, inversão do ônus da prova e fundamentação robusta em precedentes do STJ.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* Pricing / SaaS Section (New) */}
      <section className="py-24 bg-slate-950 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-white">Planos Comerciais</h2>
               <p className="text-slate-400">Escolha a robustez ideal para sua atuação jurídica.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               {/* Essential */}
               <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col relative">
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Essencial</h3>
                  <div className="text-3xl font-bold text-white mb-6">R$ 89<span className="text-sm font-normal text-slate-500">/mês</span></div>
                  <ul className="space-y-4 mb-8 flex-1">
                     <li className="flex items-center text-sm text-slate-400"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> Petições Simples</li>
                     <li className="flex items-center text-sm text-slate-400"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> Pesquisa de Leis</li>
                     <li className="flex items-center text-sm text-slate-400"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> 15 documentos/mês</li>
                  </ul>
                  <button onClick={onEnter} className="w-full py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-medium">Começar Grátis</button>
               </div>

               {/* Professional - Highlighted */}
               <div className="bg-slate-800 p-8 rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-900/20 flex flex-col relative transform md:-translate-y-4">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MAIS POPULAR</div>
                  <h3 className="text-lg font-medium text-emerald-400 mb-2">Profissional</h3>
                  <div className="text-3xl font-bold text-white mb-6">R$ 197<span className="text-sm font-normal text-slate-500">/mês</span></div>
                  <ul className="space-y-4 mb-8 flex-1">
                     <li className="flex items-center text-sm text-slate-300"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> Petições Completas (JEC/Cível)</li>
                     <li className="flex items-center text-sm text-slate-300"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> Análise Contratual Avançada</li>
                     <li className="flex items-center text-sm text-slate-300"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> Pesquisa Jurisprudencial</li>
                     <li className="flex items-center text-sm text-slate-300"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> Documentos Ilimitados</li>
                  </ul>
                  <button onClick={onEnter} className="w-full py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors font-bold shadow-lg">Assinar Agora</button>
               </div>

               {/* Office */}
               <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col">
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Escritório</h3>
                  <div className="text-3xl font-bold text-white mb-6">Sob Consulta</div>
                  <ul className="space-y-4 mb-8 flex-1">
                     <li className="flex items-center text-sm text-slate-400"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> Multi-usuários</li>
                     <li className="flex items-center text-sm text-slate-400"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> Gestão de Casos</li>
                     <li className="flex items-center text-sm text-slate-400"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> API Dedicada</li>
                     <li className="flex items-center text-sm text-slate-400"><Icons.Check className="w-4 h-4 text-emerald-500 mr-3"/> Treinamento Personalizado</li>
                  </ul>
                  <button onClick={onEnter} className="w-full py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-medium">Falar com Consultor</button>
               </div>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Interface",
              icon: "Layout",
              desc: "Editor jurídico inteligente com pré-visualização em tempo real."
            },
            {
              title: "Agentes IA",
              icon: "Bot",
              desc: "Orquestração de múltiplos agentes para tarefas complexas."
            },
            {
              title: "Base Oficial",
              icon: "Scale",
              desc: "Fundamentação exclusiva em leis e julgados brasileiros."
            },
            {
              title: "Segurança",
              icon: "ShieldCheck",
              desc: "Criptografia ponta a ponta e total conformidade com a LGPD."
            }
          ].map((layer, i) => (
            <div key={i} className="bg-slate-800/40 p-6 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 text-emerald-500">
                {React.createElement((Icons as any)[layer.icon] || Icons.Box)}
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-200">{layer.title}</h3>
              <p className="text-sm text-slate-500">{layer.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="mb-4 md:mb-0">
            <span className="font-serif text-emerald-500 font-bold text-lg">JusArtificial</span>
            <span className="mx-2">•</span>
            <span>Tecnologia Jurídica Avançada</span>
          </div>
          <div className="flex space-x-6">
             <a href="#" className="hover:text-emerald-400 transition-colors">Termos de Uso</a>
             <a href="#" className="hover:text-emerald-400 transition-colors">Política de Privacidade</a>
             <a href="#" className="hover:text-emerald-400 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;