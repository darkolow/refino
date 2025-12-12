import React, { useState } from 'react';
import { ResourceSelector } from '@/components/ResourceSelector';
import { PriceTable } from '@/components/PriceTable';
import { ProfitCalculator } from '@/components/ProfitCalculator';
import { ServerSelector } from '@/components/ServerSelector';
import { usePrices } from '@/hooks/usePrices';
import { type ResourceId, type TierId, type ServerId } from '@/data/albionData';
import { RefreshCw, Scroll, Clock, Database } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Index = () => {
  const [selectedResource, setSelectedResource] = useState<ResourceId>('ORE');
  const [selectedTier, setSelectedTier] = useState<TierId>('T4');
  const [selectedServer, setSelectedServer] = useState<ServerId>('west');

  const { prices, isLoading, error, lastUpdated, refetch } = usePrices(
    selectedResource,
    selectedTier,
    selectedServer
  );

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
          
          {/* API Status */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>Albion Data Project API</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Atualizado: {format(lastUpdated, "HH:mm:ss", { locale: ptBR })}</span>
              </div>
            )}
          </div>
        </header>

        {/* Resource Selector Card */}
        <section className="card-gradient rounded-xl border border-border p-6 shadow-card animate-slide-up">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-display text-xl text-foreground">Selecionar Recurso</h2>
            <div className="flex items-center gap-3">
              <ServerSelector 
                selectedServer={selectedServer}
                onServerChange={setSelectedServer}
              />
              <button
                onClick={refetch}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Atualizar</span>
              </button>
            </div>
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
              prices={prices}
              isLoading={isLoading}
              error={error}
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
              prices={prices}
              isLoading={isLoading}
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t border-border space-y-2">
          <p>Dados fornecidos pelo <a href="https://www.albion-online-data.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Albion Data Project</a></p>
          <p className="text-xs">Os preços são coletados por jogadores usando o cliente de dados. Instale o cliente para contribuir!</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
