import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface OrderPutByIdParams {
  id: number;
}

interface OrderPutByIdWithZoneIdBody {
  zoneId: number
}

export async function orderPutByIdWithZoneIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params: OrderPutByIdParams = req.params as any;

    const order = await getRepository(Order).findOne({ id: params.id });
    if (!order) return sendError(404, 'post not found', next);

    const body: OrderPutByIdWithZoneIdBody = req.body;
    const newOrder = await getRepository(Order).save({...order, zoneId: body.zoneId, isManualZoneSelection: true});

    res.status(201).json(newOrder);
  } catch (err) {
    console.log('putByIdWithZoneId Error', err);
  }
}
