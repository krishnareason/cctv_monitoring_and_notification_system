import {
  getCameras,
  addNewCamera,
  updateCameraData,
  removeCamera,
  getCameraStatistics,
  resolveAlert as resolveAlertService,
  getActiveAlerts,
} from '../services/cameraMonitor.js';

// GET all cameras
export const getAllCameras = async (req, res) => {
  try {
    const cameras = await getCameras();
    res.json(cameras);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cameras' });
  }
};

// POST add a new camera
export const addCamera = async (req, res) => {
  try {
    const { name, ipAddress } = req.body;

    if (!name || !ipAddress) {
      return res.status(400).json({ error: 'Name and IP address are required' });
    }

    const ipRegex = /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:8080$/;
    if (!ipRegex.test(ipAddress)) {
      return res.status(400).json({ error: 'Invalid IP format. Use http://192.168.x.x:8080' });
    }

    const camera = await addNewCamera(name, ipAddress);
    res.status(201).json(camera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update camera
export const updateCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const camera = await updateCameraData(id, updateData);
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    res.json(camera);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update camera' });
  }
};

// DELETE a camera
export const deleteCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await removeCamera(id);

    if (!success) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    res.json({ message: 'Camera deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete camera' });
  }
};

// GET camera system status
export const getCameraStatus = async (req, res) => {
  try {
    const status = await getCameraStatistics();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get camera status' });
  }
};

// POST resolve alert
export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    const success = await resolveAlertService(id, remark);

    if (!success) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert resolved successfully' });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
};

// GET all unresolved alerts
export const getAlerts = async (req, res) => {
  try {
    const alerts = await getActiveAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get alerts' });
  }
};
