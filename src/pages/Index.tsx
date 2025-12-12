import { useState, useMemo } from 'react';
import { ResourceSelector } from '@/components/ResourceSelector';
import { PriceTable } from '@/components/PriceTable';
import { ProfitCalculator } from '@/components/ProfitCalculator';
import { generateMockPrices, type ResourceId, type TierId } from '@/data/albionData';
import { RefreshCw, Scroll } from 'lucide-react';

const Index = () => {
  const [selectedResource, setSelectedResource] = useState<ResourceId>('ore');
  const [selectedTier, setSelectedTier] = useState<TierId>('t4');
  const [prices, setPrices] = useState(() => generateMockPrices());

  const refreshPrices = () => {
    setPrices(generateMockPrices());
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <Scroll className="w-10 h-10 text-primary" />
            <h1 className="font-display text-4xl md:text-5xl text-gradient-gold">
              Albion Market
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Calculadora de recursos para Albion Online. Compare preços entre cidades e encontre as melhores rotas de comércio.
          </p>
        </header>

        {/* Resource Selector Card */}
        <section className="card-gradient rounded-xl border border-border p-6 shadow-card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground">Selecionar Recurso</h2>
            <button
              onClick={refreshPrices}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Atualizar Preços</span>
            </button>
          </div>
          <ResourceSelector
            selectedResource={selectedResource}
            selectedTier={selectedTier}
            onResourceChange={setSelectedResource}
            onTierChange={setSelectedTier}
          />
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Price Table Card */}
          <section 
            className="card-gradient rounded-xl border border-border p-6 shadow-card animate-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            <h2 className="font-display text-xl text-foreground mb-4">Preços por Cidade</h2>
            <PriceTable
              selectedResource={selectedResource}
              selectedTier={selectedTier}
              prices={prices}
            />
          </section>

          {/* Profit Calculator Card */}
          <section 
            className="card-gradient rounded-xl border border-border p-6 shadow-card animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="font-display text-xl text-foreground mb-4">Calculadora de Lucro</h2>
            <ProfitCalculator
              selectedResource={selectedResource}
              selectedTier={selectedTier}
              prices={prices}
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
          <p>Os preços exibidos são simulados. Para dados reais, conecte à API do Albion Data Project.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
