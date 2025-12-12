import React from 'react';
import { servers, type ServerId } from '@/data/albionData';
import { Globe } from 'lucide-react';

interface ServerSelectorProps {
  selectedServer: ServerId;
  onServerChange: (server: ServerId) => void;
}

export const ServerSelector = ({ selectedServer, onServerChange }: ServerSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <select
        value={selectedServer}
        onChange={(e) => onServerChange(e.target.value as ServerId)}
        className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
      >
        {servers.map(server => (
          <option key={server.id} value={server.id}>
            {server.name}
          </option>
        ))}
      </select>
    </div>
  );
};
