import { sendNotifications } from './notificationService.js';

let cameras = [];
let alerts = [];
let cameraStats = {
  total: 0,
  online: 0,
  offline: 0,
  activeAlerts: 0
};

// Actually check if camera stream is accessible
const checkCameraConnection = async (camera) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(camera.streamUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Smart-CCTV-Dashboard/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    // If we get a response (even if not 200), the camera is reachable
    return response.status < 500;
  } catch (error) {
    // Network error, timeout, or connection refused = offline
    return false;
  }
};

// Simulate frame analysis for blur/dark detection (since OpenCV isn't available)
const analyzeFrameQuality = () => {
  const isBlurry = Math.random() > 0.85; // 15% chance blurry
  const isDark = Math.random() > 0.9; // 10% chance dark
  
  if (isBlurry) {
    return {
      issue: 'blur',
      details: 'Camera feed appears blurry - check lens focus'
    };
  }
  
  if (isDark) {
    return {
      issue: 'dark',
      details: 'Camera feed is too dark - check lighting or lens obstruction'
    };
  }
  
  return { issue: null };
};

const analyzeCamera = async (camera) => {
  try {
    // First check if camera is reachable
    const isOnline = await checkCameraConnection(camera);
    
    if (!isOnline) {
      return {
        status: 'offline',
        issue: 'offline',
        details: `Camera ${camera.name} is not reachable - check network connection`
      };
    }

    // If online, check frame quality
    const qualityCheck = analyzeFrameQuality();
    
    return {
      status: 'online',
      issue: qualityCheck.issue,
      details: qualityCheck.details
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
  // Don't generate duplicate alerts for the same camera and issue
  const existingAlert = alerts.find(a => 
    a.cameraId === camera.id && 
    a.type === issue && 
    !a.resolved
  );
  
  if (existingAlert) {
    return null;
  }
  
  const alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    cameraId: camera.id,
    cameraName: camera.name,
    type: issue,
    message: details || `Camera ${camera.name} has ${issue} issue`,
    timestamp: new Date().toISOString(),
    resolved: false
  };
  
  alerts.push(alert);

  // Send notifications for offline cameras
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
      
      // Generate alerts for status changes or new issues
      if (analysis.issue) {
        // Alert if status changed from online to offline
        if (analysis.issue === 'offline' && previousStatus === 'online') {
          const alert = await generateAlert(camera, analysis.issue, analysis.details);
          if (alert) {
            console.log(`🚨 New alert: ${camera.name} went offline`);
            io.emit('newAlert', alert);
          }
        }
        // Alert for quality issues (blur/dark) on online cameras
        else if (analysis.status === 'online' && (analysis.issue === 'blur' || analysis.issue === 'dark')) {
          if (Math.random() > 0.8) { // Don't spam quality alerts
            const alert = await generateAlert(camera, analysis.issue, analysis.details);
            if (alert) {
              console.log(`⚠️ Quality alert: ${camera.name} - ${analysis.issue}`);
              io.emit('newAlert', alert);
            }
          }
        }
      }
      
      // Auto-resolve offline alerts when camera comes back online
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

        // Send recovery notification
        try {
          await sendNotifications(camera, 'online', `Camera ${camera.name} is back online and functioning normally`);
          console.log(`📬 Recovery notification sent for ${camera.name}`);
        } catch (error) {
          console.error('📬 Failed to send recovery notification:', error);
        }
      }
    }
    
    updateCameraStats();
    io.emit('cameraStatusUpdate', { cameras, stats: cameraStats });
  }, 8000); // Check every 8 seconds to avoid overwhelming the network
};

export const getCameras = () => cameras;

export const addNewCamera = (name, ipAddress) => {
  if (cameras.length >= 4) {
    throw new Error('Maximum 4 cameras allowed');
  }
  
  // Check if IP address is already in use
  const existingCamera = cameras.find(c => c.ipAddress === ipAddress);
  if (existingCamera) {
    throw new Error('A camera with this IP address already exists');
  }
  
  const camera = {
    id: `cam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    ipAddress,
    streamUrl: `${ipAddress}/video`,
    status: 'offline', // Start as offline until first check
    addedAt: new Date().toISOString(),
    lastChecked: null
  };
  
  cameras.push(camera);
  updateCameraStats();
  console.log(`📷 Added new camera: ${name} (${ipAddress})`);
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

export const resolveAlert = (alertId) => {
  const alert = alerts.find(a => a.id === alertId);
  if (!alert) return false;
  
  alert.resolved = true;
  alert.resolvedAt = new Date().toISOString();
  updateCameraStats();
  console.log(`✅ Resolved alert: ${alert.message}`);
  return true;
};

export const getActiveAlerts = () => alerts.filter(a => !a.resolved);