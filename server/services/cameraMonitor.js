import { sendNotifications } from './notificationService.js';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

let ioInstance = null;

const checkCameraConnection = async (camera) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(camera.stream_url, {
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
  const [existing] = await db.execute(
    `SELECT * FROM alerts WHERE camera_id = ? AND type = ? AND resolved = FALSE`,
    [camera.id, issue]
  );

  if (existing.length > 0) return null;

  const alertId = uuidv4();
  const timestamp = new Date();

  await db.execute(
    `INSERT INTO alerts (id, camera_id, type, message, timestamp, resolved) VALUES (?, ?, ?, ?, ?, FALSE)`,
    [alertId, camera.id, issue, details, timestamp]
  );

  if (issue === 'offline') {
    try {
      await sendNotifications(camera, issue, details);
      console.log(`📬 Notification sent for offline camera: ${camera.name}`);
    } catch (error) {
      console.error('📬 Notification failed:', error);
    }
  }

  return {
    id: alertId,
    cameraId: camera.id,
    type: issue,
    message: details,
    timestamp,
    resolved: false
  };
};

const updateCameraStatus = async (id, status) => {
  await db.execute(`UPDATE cameras SET status = ?, last_checked = ? WHERE id = ?`, [
    status,
    new Date(),
    id
  ]);
};

// ✅ ADDED THIS FUNCTION TO FIX THE ERROR
export const updateCameraData = async (id, updateData) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updateData)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return null;

  values.push(id);

  const [result] = await db.execute(
    `UPDATE cameras SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) return null;

  const [updatedRows] = await db.execute(`SELECT * FROM cameras WHERE id = ?`, [id]);
  return updatedRows[0];
};

export const getCameraStatistics = async () => {
  const [[total]] = await db.execute(`SELECT COUNT(*) AS count FROM cameras`);
  const [[online]] = await db.execute(`SELECT COUNT(*) AS count FROM cameras WHERE status = 'online'`);
  const [[offline]] = await db.execute(`SELECT COUNT(*) AS count FROM cameras WHERE status = 'offline'`);
  const [[activeAlerts]] = await db.execute(`SELECT COUNT(*) AS count FROM alerts WHERE resolved = FALSE`);

  return {
    total: total.count,
    online: online.count,
    offline: offline.count,
    activeAlerts: activeAlerts.count
  };
};

export const startCameraMonitoring = (io) => {
  ioInstance = io;

  console.log('🔍 Starting camera monitoring service...');
  setInterval(async () => {
    const [cameras] = await db.execute(`SELECT * FROM cameras`);

    for (const camera of cameras) {
      const previousStatus = camera.status;
      const analysis = await analyzeCamera(camera);

      await updateCameraStatus(camera.id, analysis.status);

      if (analysis.status === 'offline' && previousStatus === 'online') {
        const alert = await generateAlert(camera, 'offline', analysis.details);
        if (alert && ioInstance) ioInstance.emit('newAlert', alert);
      }

      if (analysis.status === 'online' && previousStatus === 'offline') {
        await db.execute(
          `UPDATE alerts SET resolved = TRUE, resolved_at = ? WHERE camera_id = ? AND type = 'offline' AND resolved = FALSE`,
          [new Date(), camera.id]
        );

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

    const stats = await getCameraStatistics();
    if (ioInstance) ioInstance.emit('cameraStatusUpdate', { stats });
  }, 3000);
};

export const addNewCamera = async (name, ipAddress) => {
  const [existing] = await db.execute(`SELECT * FROM cameras WHERE ip_address = ?`, [ipAddress]);
  if (existing.length > 0) throw new Error('Camera with this IP already exists');

  const id = uuidv4();
  const stream_url = `${ipAddress}/video`;
  const added_at = new Date();

  await db.execute(
    `INSERT INTO cameras (id, name, ip_address, stream_url, added_at, status) VALUES (?, ?, ?, ?, ?, 'offline')`,
    [id, name, ipAddress, stream_url, added_at]
  );

  console.log(`📷 Added new camera: ${name} (${ipAddress})`);
  return { id, name, ip_address: ipAddress, stream_url };
};

export const getCameras = async () => {
  const [rows] = await db.execute(`SELECT * FROM cameras`);
  return rows;
};

export const removeCamera = async (id) => {
  const [result] = await db.execute(`DELETE FROM cameras WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

export const getActiveAlerts = async () => {
  const [rows] = await db.execute(`SELECT * FROM alerts WHERE resolved = FALSE`);
  return rows;
};

export const resolveAlert = async (alertId, remark = null) => {
  const resolved_at = new Date();
  const [result] = await db.execute(
    `UPDATE alerts SET resolved = TRUE, resolved_at = ?, remark = ? WHERE id = ?`,
    [resolved_at, remark, alertId]
  );

  if (result.affectedRows > 0 && ioInstance) {
    const [[alert]] = await db.execute(`SELECT * FROM alerts WHERE id = ?`, [alertId]);
    ioInstance.emit('resolvedAlert', alert);

    const stats = await getCameraStatistics();
    ioInstance.emit('cameraStatusUpdate', { stats });
  }

  return result.affectedRows > 0;
};
