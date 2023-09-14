import { Router } from 'express';
import {
  getKeoController,
  postKeoController
} from '~/controllers/keo.controllers';
import { postKeoValidator } from '~/middlewares/keo.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const keosRouter = Router();

/**
 * @openapi
 * /keo-hom-nay:
 *  get:
 *    tags:
 *      - Kèo
 *    summary: Các kèo hôm nay
 *    description: Get các kèo hôm nay nhé các thầy
 *    operationId: keo-homnay
 *    responses:
 *      '200':
 *        description: Get kèo thành công
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Get keo success
 *                result:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/GetKeoSuccess'
 */

/**
 * Get Keo
 * Path: /
 * Method: GET
 * Body: KeoRequestBody
 */
keosRouter.get('', wrapRequestHandler(getKeoController));
keosRouter.post('', postKeoValidator, wrapRequestHandler(postKeoController));

export default keosRouter;
