import { resourceTypes, tiers, type ResourceId, type TierId } from '@/data/albionData';

interface ResourceSelectorProps {
  selectedResource: ResourceId;
  selectedTier: TierId;
  onResourceChange: (resource: ResourceId) => void;
  onTierChange: (tier: TierId) => void;
}

export const ResourceSelector = ({
  selectedResource,
  selectedTier,
  onResourceChange,
  onTierChange,
}: ResourceSelectorProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg text-foreground mb-3">Recurso</h3>
        <div className="grid grid-cols-5 gap-2">
          {resourceTypes.map((resource) => (
            <button
              key={resource.id}
              onClick={() => onResourceChange(resource.id)}
              className={`
                flex flex-col items-center p-3 rounded-lg border transition-all duration-200
                ${selectedResource === resource.id
                  ? 'border-primary bg-primary/10 glow-gold'
                  : 'border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary'
                }
              `}
            >
              <span className="text-2xl mb-1">{resource.icon}</span>
              <span className="text-xs text-muted-foreground">{resource.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-foreground mb-3">Tier</h3>
        <div className="flex gap-2">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => onTierChange(tier.id)}
              className={`
                flex-1 py-2 px-4 rounded-lg border font-display text-sm transition-all duration-200
                ${selectedTier === tier.id
                  ? 'border-primary bg-primary/10 text-primary glow-gold'
                  : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }
              `}
            >
              {tier.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
