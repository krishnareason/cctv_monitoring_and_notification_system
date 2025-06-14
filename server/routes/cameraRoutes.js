import express from 'express';
import * as cameraController from '../controllers/cameraController.js';

const router = express.Router();

// Camera management routes
router.get('/', cameraController.getAllCameras);
router.post('/', cameraController.addCamera);
router.put('/:id', cameraController.updateCamera);
router.delete('/:id', cameraController.deleteCamera);
router.get('/status', cameraController.getCameraStatus);
router.get('/alerts', cameraController.getAlerts);
router.post('/alerts/:id/resolve', cameraController.resolveAlert);

export default router;