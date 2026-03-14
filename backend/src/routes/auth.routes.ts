import { Router } from 'express';
import { body } from 'express-validator';
import { validate, authenticate, authorize } from '../middleware/index.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post(
  '/register',
  [
    body('nombres').notEmpty().withMessage('El nombre es requerido'),
    body('apellidos').notEmpty().withMessage('El apellido es requerido'),
    body('correo').isEmail().withMessage('Correo inválido'),
    body('clave').isLength({ min: 6 }).withMessage('La clave debe tener al menos 6 caracteres'),
    validate,
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('correo').isEmail().withMessage('Correo inválido'),
    body('clave').notEmpty().withMessage('La clave es requerida'),
    validate,
  ],
  authController.login
);

router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);

router.patch(
  '/users/:id/role',
  authenticate,
  authorize('Admin'),
  [
    body('tipoUsuario').isIn(['Admin', 'Pasajero']).withMessage('Tipo debe ser Admin o Pasajero'),
    validate,
  ],
  authController.updateRole
);

export default router;
