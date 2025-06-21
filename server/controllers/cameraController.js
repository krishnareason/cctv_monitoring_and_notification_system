import { getCameras, addNewCamera, updateCameraData, removeCamera, getCameraStatistics, resolveAlert as resolveAlertService, getActiveAlerts } from '../services/cameraMonitor.js';

export const getAllCameras = (req, res) => {
  try {
    const cameras = getCameras();
    res.json(cameras);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cameras' });
  }
};

export const addCamera = (req, res) => {
  try {
    const { name, ipAddress } = req.body;
    
    if (!name || !ipAddress) {
      return res.status(400).json({ error: 'Name and IP address are required' });
    }

    const ipRegex = /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:8080$/;
    if (!ipRegex.test(ipAddress)) {
      return res.status(400).json({ error: 'Invalid IP format. Use http://192.168.x.x:8080' });
    }

    const camera = addNewCamera(name, ipAddress);
    res.status(201).json(camera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCamera = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const camera = updateCameraData(id, updateData);
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    
    res.json(camera);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update camera' });
  }
};

export const deleteCamera = (req, res) => {
  try {
    const { id } = req.params;
    const success = removeCamera(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    
    res.json({ message: 'Camera deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete camera' });
  }
};

export const getCameraStatus = (req, res) => {
  try {
    const status = getCameraStatistics();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get camera status' });
  }
};

export const resolveAlert = (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body; // <-- NEW

    const success = resolveAlertService(id, remark); // pass remark to service
    
    if (!success) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ message: 'Alert resolved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
};

export const getAlerts = (req, res) => {
  try {
    const alerts = getActiveAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get alerts' });
  }
};
