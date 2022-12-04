import { Order } from 'api/order/order.entity';
import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface OrderPostByTrackingNumberListBody {
  trackingNumberList: string[];
}

export async function orderPostByTrackingNumberListHandler(req: Request, res: Response, next: NextFunction) {
  const body: OrderPostByTrackingNumberListBody = req.body as any;
  const trackList = body.trackingNumberList;
  if (trackList.length === 0) return sendError(404, 'no item in the list', next);

  const resultList = [];
  for (let track of trackList) {
    const order = await getRepository(Order).findOne({ trackingNumber: track, isDeleted: false });
    if (order) {
      const addQueryCount = order.queryedCount + 1;
      let result: any = order;
      if (order.zoneId && order.zoneId !== 0) {
        const zone = await getRepository(Zone).findOne({ id: order.zoneId, isDeleted: false });
        result = { ...order, zone };
        const newOrder = { ...order, queryedCount: addQueryCount };
        await getRepository(Order).save(newOrder);
      } else {
        const newOrder = { ...order, queryedCount: addQueryCount };
        await getRepository(Order).save(newOrder);
        result = { ...order, zone: undefined };
      }
      resultList.push(result);
    } else {
      const undefinedOrder = {
        trackingNumber: track,
        MAWB: 'Not Found',
        containerNumber: 'Not Found',
        shipper: 'Not Found',
        shipperPhoneNumber: 'Not Found',
        shipperAddress: 'Not Found',
        destinationCountry: 'Not Found',
        recipient: 'Not Found',
        RUT: 'Not Found',
        recipientPhoneNumber: 'Not Found',
        recipientEmail: 'Not Found',
        region: 'Not Found',
        province: 'Not Found',
        comuna: 'Not Found',
        address: 'Not Found',
        weight: 'Not Found',
        height: 'Not Found',
        length: 'Not Found',
        width: 'Not Found',
        value: 'Not Found',
        quantity: 'Not Found',
        description: 'Not Found',
      };
      resultList.push(undefinedOrder);
    }
  }

  res.status(200).json(resultList);
}
