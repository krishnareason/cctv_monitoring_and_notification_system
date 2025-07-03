import * as monitor from '../services/cameraMonitor.js';

export const getAllCameras = async (req, res) => {
  const data = await monitor.getCameras();
  res.json(data);
};

export const addCamera = async (req, res) => {
  const { name, ipAddress } = req.body;
  if (!name || !ipAddress) {
    return res.status(400).json({ error: 'Missing camera name or IP address' });
  }

  try {
    const camera = await monitor.addNewCamera(name, ipAddress);
    res.status(201).json(camera);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCamera = async (req, res) => {
  res.status(501).json({ error: 'Update not implemented' });
};

export const deleteCamera = async (req, res) => {
  const id = req.params.id;
  const success = await monitor.removeCamera(id);
  if (success) res.status(200).json({ message: 'Camera deleted' });
  else res.status(404).json({ error: 'Camera not found' });
};

export const getCameraStatus = async (req, res) => {
  const stats = await monitor.getCameraStatistics();
  res.json(stats);
};

export const getAlerts = async (req, res) => {
  const data = await monitor.getActiveAlerts();
  res.json(data);
};

// ✅ FIXED: alert ID parsed safely as an integer
export const resolveAlert = async (req, res) => {
  const alertId = parseInt(req.params.id); // ensure integer ID
  const { remark } = req.body;

  if (isNaN(alertId)) {
    return res.status(400).json({ error: 'Invalid alert ID' });
  }

  const success = await monitor.resolveAlert(alertId, remark);
  if (success) res.status(200).json({ message: 'Alert resolved' });
  else res.status(404).json({ error: 'Alert not found' });
};
