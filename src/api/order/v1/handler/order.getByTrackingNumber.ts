import { Order } from 'api/order/order.entity';
import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { findZoneByGooglePosition, getAddressStringByOrder } from 'utils/calculationHelper';
import sendError from 'utils/error';
import { geoCodeing } from 'utils/googleService';

interface OrderGetByTrackingNumberParams {
  trackingNumber: string;
}

export async function orderGetByTrackingNumberHandler(req: Request, res: Response, next: NextFunction) {
  const params: OrderGetByTrackingNumberParams = req.params as any;

  const order = await getRepository(Order).findOne({ trackingNumber: params.trackingNumber, isDeleted: false });
  if (!order) return sendError(404, 'order not found', next);
  const addQueryCount = order.queryedCount + 1;
  let result: any = order;

  if (order.zoneId && order.zoneId !== 0) {
    const zone = await getRepository(Zone).findOne({ id: order.zoneId, isDeleted: false });
    result = { ...order, zone };
    const newOrder = { ...order, queryedCount: addQueryCount };
    await getRepository(Order).save(newOrder);
  } else {
    const address = getAddressStringByOrder(order);
    const orderLoactionArray = await geoCodeing(address);

    if (orderLoactionArray.length !== 0) {
      const orderLoactionJson = orderLoactionArray[0];
      const zone = await findZoneByGooglePosition(orderLoactionJson);

      if (zone) {
        result = { ...order, zone, placeId: orderLoactionJson.place_id };
        const newOrder = {
          ...order,
          zoneId: zone.id,
          placeIdInGoogle: orderLoactionArray.place_id,
          queryedCount: addQueryCount,
        };
        await getRepository(Order).save(newOrder);
      } else {
        result = { ...order, zone: undefined, placeId: orderLoactionJson.place_id };
        const newOrder = {
          ...order,
          zoneId: -1,
          placeIdInGoogle: orderLoactionArray.place_id,
          queryedCount: addQueryCount,
        };
        await getRepository(Order).save(newOrder);
      }
    } else {
      const newOrder = { ...order, queryedCount: addQueryCount };
      await getRepository(Order).save(newOrder);
      console.log("haven't found location by Google");
    }
  }

  res.status(200).json(result);
}
