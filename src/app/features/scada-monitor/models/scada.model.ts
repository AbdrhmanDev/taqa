export interface ScadaStation {
  stationId: number;
  name: string;
  status: 'Online' | 'Offline' | 'Alarm' | 'Running';
  zone?: string;
  lastSignal?: string;
  compressor?: ScadaCompressor;
  dispensers: ScadaDispenser[];
  kpis: {
    totalFlow: number;
    inletPressure: number;
    outletPressure: number;
    revenue?: number;
    vehicles?: number;
    shiftStartTime?: string;
  };
}

export interface ScadaCompressor {
  id: number;
  model: string;
  status: string;
  vibration: number;
  oilPressure: number;
  stages: {
    pressure: number;
    temperature: number;
  }[];
}

export interface ScadaDispenser {
  id: number;
  name: string;
  status: 'Idle' | 'Filling' | 'Fault';
  currentReading: number;
  left?: { volume: number; throughput: number };
  right?: { volume: number; throughput: number };
}
