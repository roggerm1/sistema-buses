import { Router } from 'express';
import { body } from 'express-validator';
import { validate, authenticate, authorize } from '../middleware/index.js';
import * as busController from '../controllers/bus.controller.js';

const router = Router();

router.use(authenticate, authorize('Admin'));

router.get('/', busController.getAll);

router.post(
  '/',
  [
    body('numeroPlaca').notEmpty().withMessage('La placa es requerida'),
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('capacidad')
      .isInt({ min: 1, max: 15 })
      .withMessage('La capacidad debe ser entre 1 y 15'),
    validate,
  ],
  busController.create
);

router.get('/:id', busController.getById);

router.put(
  '/:id',
  [
    body('nombre')
      .optional()
      .notEmpty()
      .withMessage('El nombre no puede estar vacío'),
    body('capacidad')
      .optional()
      .isInt({ min: 1, max: 15 })
      .withMessage('La capacidad debe ser entre 1 y 15'),
    body('disponible')
      .optional()
      .isBoolean()
      .withMessage('Disponible debe ser verdadero o falso'),
    validate,
  ],
  busController.update
);

router.delete('/:id', busController.remove);

export default router;
