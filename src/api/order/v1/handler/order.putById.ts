import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface OrderPutByIdParams {
  id: number;
}

interface OrderPutByIdBody {
  MAWB: string;
  containerNumber: string;
  trackingNumber: string;
  shipper: string;
  shipperPhoneNumber: string;
  shipperAddress: string;
  destinationCountry: string;
  recipient: string;
  RUT: string;
  recipientPhoneNumber: string;
  recipientEmail: string;
  region: string;
  province: string;
  comuna: string;
  detailAddress: string;
  weight: number;
  value: number;
  description: string;
  quantity: number;
  createdBy: number;
}

export async function orderPutByIdHandler(req: Request, res: Response, next: NextFunction) {
  const params: OrderPutByIdParams = req.params as any;

  const order = await getRepository(Order).findOne({ id: params.id });
  if (!order) return sendError(404, 'post not found', next);

  const body: OrderPutByIdBody = req.body;
  const newOrder = { ...body, id: order.id };
  await getRepository(Order).save(newOrder);

  res.status(200).json({ id: order.id });
}
