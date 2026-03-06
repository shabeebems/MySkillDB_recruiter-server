import { Router } from 'express';
import { FlipCardController } from '../controller/flipCard.controller';
import { authenticateToken } from '../middlewares/tokenValidation';
import { validate } from '../middlewares/zodValidate';
import { createFlipCardSchema, updateFlipCardSchema, createBatchFlipCardsSchema } from '../schemas/flipCard.schema';

const flipCardRouter: Router = Router();
const flipCardController = new FlipCardController();

// Student and Teacher accessible route - placed before global middleware
flipCardRouter.get('/job/:jobId', authenticateToken(['master_admin', 'org_admin', 'student', 'teacher', 'hod']), flipCardController.getFlipCardsByJob);

flipCardRouter.use(authenticateToken(['master_admin', 'org_admin']));

flipCardRouter.post('/', validate(createFlipCardSchema), flipCardController.createFlipCard);
flipCardRouter.post('/batch', validate(createBatchFlipCardsSchema), flipCardController.createBatchFlipCards);
flipCardRouter.put('/:id', validate(updateFlipCardSchema), flipCardController.updateFlipCard);
flipCardRouter.delete('/:id', flipCardController.deleteFlipCard);

export default flipCardRouter;

