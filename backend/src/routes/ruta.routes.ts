import { Router } from 'express';
import { body } from 'express-validator';
import { validate, authenticate, authorize } from '../middleware/index.js';
import * as rutaController from '../controllers/ruta.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', rutaController.getAll);

router.post(
  '/',
  authorize('Admin'),
  [
    body('origen')
      .notEmpty()
      .withMessage('El origen es requerido'),
    body('destino')
      .notEmpty()
      .withMessage('El destino es requerido'),
    body().custom((_, { req }) => {
      if (req.body.origen && req.body.destino && req.body.origen === req.body.destino) {
        throw new Error('El origen y el destino no pueden ser iguales');
      }
      return true;
    }),
    validate,
  ],
  rutaController.create
);

router.get('/:id', rutaController.getById);

router.put(
  '/:id',
  authorize('Admin'),
  [
    body('origen')
      .optional()
      .notEmpty()
      .withMessage('El origen no puede estar vacío'),
    body('destino')
      .optional()
      .notEmpty()
      .withMessage('El destino no puede estar vacío'),
    validate,
  ],
  rutaController.update
);

router.delete('/:id', authorize('Admin'), rutaController.remove);

export default router;
