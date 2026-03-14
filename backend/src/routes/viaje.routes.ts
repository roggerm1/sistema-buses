import { Router } from 'express';
import { body, query } from 'express-validator';
import { validate, authenticate, authorize } from '../middleware/index.js';
import * as viajeController from '../controllers/viaje.controller.js';

const router = Router();

router.use(authenticate);

// --- Pasajero routes (fixed paths first to avoid /:id clash) ---

router.get(
  '/buscar',
  authorize('Pasajero'),
  [
    query('origen').notEmpty().withMessage('El origen es requerido'),
    query('destino').notEmpty().withMessage('El destino es requerido'),
    query('fecha').isISO8601().withMessage('La fecha debe ser válida (YYYY-MM-DD)'),
    validate,
  ],
  viajeController.searchTrips
);

router.get('/mis-viajes', authorize('Pasajero'), viajeController.getUserTrips);

router.get('/:id/asientos', authorize('Pasajero'), viajeController.getSeatsForTrip);

// --- Admin routes ---

router.get('/', authorize('Admin'), viajeController.getAll);

router.post(
  '/',
  authorize('Admin'),
  [
    body('idBus').notEmpty().withMessage('El ID del bus es requerido'),
    body('idRuta').notEmpty().withMessage('El ID de la ruta es requerido'),
    body('fechaSalida')
      .isISO8601()
      .withMessage('La fecha de salida debe ser válida (YYYY-MM-DD)'),
    body('horaSalida')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('La hora de salida debe tener formato HH:MM'),
    body('fechaLlegada')
      .isISO8601()
      .withMessage('La fecha de llegada debe ser válida (YYYY-MM-DD)'),
    body('horaLlegada')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('La hora de llegada debe tener formato HH:MM'),
    body('precio')
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser un número positivo'),
    validate,
  ],
  viajeController.create
);

router.get('/:id/reservas', authorize('Admin'), viajeController.getReservasForTrip);

router.get('/:id', authorize('Admin'), viajeController.getById);

router.put(
  '/:id',
  authorize('Admin'),
  [
    body('idBus').optional().notEmpty().withMessage('El ID del bus no puede estar vacío'),
    body('idRuta')
      .optional()
      .notEmpty()
      .withMessage('El ID de la ruta no puede estar vacío'),
    body('fechaSalida')
      .optional()
      .isISO8601()
      .withMessage('La fecha de salida debe ser válida (YYYY-MM-DD)'),
    body('horaSalida')
      .optional()
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('La hora de salida debe tener formato HH:MM'),
    body('fechaLlegada')
      .optional()
      .isISO8601()
      .withMessage('La fecha de llegada debe ser válida (YYYY-MM-DD)'),
    body('horaLlegada')
      .optional()
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('La hora de llegada debe tener formato HH:MM'),
    body('precio')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser un número positivo'),
    validate,
  ],
  viajeController.update
);

router.delete('/:id', authorize('Admin'), viajeController.remove);

export default router;
