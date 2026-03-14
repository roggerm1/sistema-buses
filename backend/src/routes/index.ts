import { Router } from 'express';
import authRoutes from './auth.routes.js';
import busRoutes from './bus.routes.js';
import rutaRoutes from './ruta.routes.js';
import viajeRoutes from './viaje.routes.js';
import reservaRoutes from './reserva.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/buses', busRoutes);
apiRouter.use('/rutas', rutaRoutes);
apiRouter.use('/viajes', viajeRoutes);
apiRouter.use('/reservas', reservaRoutes);

export { apiRouter };
