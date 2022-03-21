import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface OrderPostBody {
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

export async function orderPostHandler(req: Request, res: Response, next: NextFunction) {
  const body: OrderPostBody = req.body;
  const trackingNumber = body.trackingNumber;

  const alreadyTrackingNumber = await getRepository(Order).findOne({ trackingNumber, isDeleted: false });
  if (alreadyTrackingNumber) return sendError(400, 'TrackingNumber already in use', next);

  const newOrder = getRepository(Order).create({ ...body, createdBy: req.user.id });
  const order = await getRepository(Order).save(newOrder);

  res.status(201).json({ id: order.id });
}
