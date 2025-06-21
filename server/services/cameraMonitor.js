import { sendNotifications } from './notificationService.js';

let cameras = [];
let alerts = [];
let cameraStats = {
  total: 0,
  online: 0,
  offline: 0,
  activeAlerts: 0
};

let ioInstance = null; // 🔁 store reference to socket

const checkCameraConnection = async (camera) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(camera.streamUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Smart-CCTV-Dashboard/1.0'
      }
    });
    clearTimeout(timeoutId);
    return response.status < 500;
  } catch (error) {
    return false;
  }
};

const analyzeCamera = async (camera) => {
  try {
    const isOnline = await checkCameraConnection(camera);
    if (!isOnline) {
      return {
        status: 'offline',
        issue: 'offline',
        details: `Camera ${camera.name} is not reachable - check network connection`
      };
    }
    return {
      status: 'online',
      issue: null,
      details: null
    };
  } catch (error) {
    return {
      status: 'offline',
      issue: 'offline',
      details: `Connection error: ${error.message}`
    };
  }
};

const generateAlert = async (camera, issue, details) => {
  const existingAlert = alerts.find(a =>
    a.cameraId === camera.id &&
    a.type === issue &&
    !a.resolved
  );

  if (existingAlert) return null;

  const alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    cameraId: camera.id,
    cameraName: camera.name,
    type: issue,
    message: details || `Camera ${camera.name} has ${issue} issue`,
    timestamp: new Date().toISOString(),
    resolved: false,
    resolvedAt: null,
    remark: null
  };

  alerts.push(alert);

  if (issue === 'offline') {
    console.log(`🚨 Sending notifications for offline camera: ${camera.name}`);
    try {
      const notificationResult = await sendNotifications(camera, issue, details);
      console.log(`📬 Notification result:`, notificationResult);
    } catch (error) {
      console.error('📬 Failed to send notifications:', error);
    }
  }

  return alert;
};

const updateCameraStats = () => {
  cameraStats.total = cameras.length;
  cameraStats.online = cameras.filter(c => c.status === 'online').length;
  cameraStats.offline = cameras.filter(c => c.status === 'offline').length;
  cameraStats.activeAlerts = alerts.filter(a => !a.resolved).length;
};

export const startCameraMonitoring = (io) => {
  ioInstance = io;

  console.log('🔍 Starting camera monitoring service...');
  console.log('📬 Notification system initialized');

  setInterval(async () => {
    if (cameras.length === 0) return;

    console.log(`📡 Checking ${cameras.length} cameras...`);

    for (const camera of cameras) {
      const previousStatus = camera.status;
      const analysis = await analyzeCamera(camera);

      camera.status = analysis.status;
      camera.lastChecked = new Date().toISOString();

      if (analysis.issue === 'offline' && previousStatus === 'online') {
        const alert = await generateAlert(camera, analysis.issue, analysis.details);
        if (alert) {
          console.log(`🚨 New alert: ${camera.name} went offline`);
          io.emit('newAlert', alert);
        }
      }

      if (analysis.status === 'online' && previousStatus === 'offline') {
        const offlineAlerts = alerts.filter(a =>
          a.cameraId === camera.id &&
          a.type === 'offline' &&
          !a.resolved
        );

        offlineAlerts.forEach(alert => {
          alert.resolved = true;
          alert.resolvedAt = new Date().toISOString();
          console.log(`✅ Auto-resolved offline alert for ${camera.name}`);
        });

        try {
          await sendNotifications(
            camera,
            'online',
            `Camera ${camera.name} is back online and functioning normally`
          );
          console.log(`📬 Recovery notification sent for ${camera.name}`);
        } catch (error) {
          console.error('📬 Failed to send recovery notification:', error);
        }
      }
    }

    updateCameraStats();
    io.emit('cameraStatusUpdate', { cameras, stats: cameraStats });
  }, 3000); // Update every 3 seconds
};

export const getCameras = () => cameras;

export const addNewCamera = async (name, ipAddress) => {
  if (cameras.length >= 4) {
    throw new Error('Maximum 4 cameras allowed');
  }

  const existingCamera = cameras.find(c => c.ipAddress === ipAddress);
  if (existingCamera) {
    throw new Error('A camera with this IP address already exists');
  }

  const camera = {
    id: `cam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    ipAddress,
    streamUrl: `${ipAddress}/video`,
    status: 'offline',
    addedAt: new Date().toISOString(),
    lastChecked: null
  };

  cameras.push(camera);
  updateCameraStats();
  console.log(`📷 Added new camera: ${name} (${ipAddress})`);

  // ✅ Immediately check status after adding
  const analysis = await analyzeCamera(camera);
  camera.status = analysis.status;
  camera.lastChecked = new Date().toISOString();

  if (analysis.status === 'offline') {
    const alert = await generateAlert(camera, 'offline', analysis.details);
    if (alert && ioInstance) {
      console.log(`🚨 New offline alert (on add): ${camera.name}`);
      ioInstance.emit('newAlert', alert);
    }
  }

  return camera;
};

export const updateCameraData = (id, updateData) => {
  const cameraIndex = cameras.findIndex(c => c.id === id);
  if (cameraIndex === -1) return null;

  cameras[cameraIndex] = { ...cameras[cameraIndex], ...updateData };
  updateCameraStats();
  return cameras[cameraIndex];
};

export const removeCamera = (id) => {
  const initialLength = cameras.length;
  const cameraToRemove = cameras.find(c => c.id === id);

  cameras = cameras.filter(c => c.id !== id);
  alerts = alerts.filter(a => a.cameraId !== id);

  if (cameras.length < initialLength) {
    updateCameraStats();
    console.log(`🗑️ Removed camera: ${cameraToRemove?.name || id}`);
    return true;
  }
  return false;
};

export const getCameraStatistics = () => cameraStats;

export const resolveAlert = (alertId, remark = null) => {
  const alert = alerts.find(a => a.id === alertId);
  if (!alert) return false;

  alert.resolved = true;
  alert.resolvedAt = new Date().toISOString();
  alert.remark = remark;

  updateCameraStats();
  console.log(`✅ Resolved alert: ${alert.message}, Remark: ${remark || 'None'}`);

  if (ioInstance) {
    ioInstance.emit('resolvedAlert', alert);
    ioInstance.emit('cameraStatusUpdate', { cameras, stats: cameraStats });
  }

  return true;
};

export const getActiveAlerts = () => alerts.filter(a => !a.resolved);
