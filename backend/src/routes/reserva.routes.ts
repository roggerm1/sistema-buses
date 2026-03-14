import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate, authenticate, authorize } from '../middleware/index.js';
import * as reservaController from '../controllers/reserva.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('Pasajero'),
  [
    body('idViaje').notEmpty().withMessage('El ID del viaje es requerido'),
    body('asientos')
      .isArray({ min: 1 })
      .withMessage('Debe seleccionar al menos un asiento'),
    body('asientos.*.numeroAsiento')
      .isInt({ min: 1 })
      .withMessage('El número de asiento debe ser un entero positivo'),
    validate,
  ],
  reservaController.create
);

router.delete(
  '/:id',
  authorize('Pasajero'),
  [param('id').isMongoId().withMessage('ID de reserva inválido'), validate],
  reservaController.cancel
);

export default router;
