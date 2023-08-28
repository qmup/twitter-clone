import { Router } from 'express';
import { serveImageController } from '~/controllers/medias.controllers';
import { wrapRequestHandler } from '~/utils/handlers';

const staticRouter = Router();

staticRouter.get('/image/:name', wrapRequestHandler(serveImageController));

export default staticRouter;
