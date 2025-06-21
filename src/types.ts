// src/types.ts
export interface Alert {
  id: string;
  cameraId: string;
  cameraName: string;
  type: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt: string | null;
  remark: string | null;
}

export interface Camera {
  id: string;
  name: string;
  ipAddress: string;
  streamUrl?: string;  // optional for flexibility
  status: string;
  addedAt: string;
  lastChecked: string | null;
}
