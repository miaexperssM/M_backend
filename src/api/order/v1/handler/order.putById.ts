import { Order } from 'api/order/order.entity';
import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection, getRepository } from 'typeorm';
import { findZoneByGooglePosition, getAddressStringByOrder, isInPolygon } from 'utils/calculationHelper';
import sendError from 'utils/error';
import { geoCodeing } from 'utils/googleService';

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
  address: string;
  weight: number;
  value: number;
  description: string;
  quantity: number;
  createdBy: number;
}

export async function orderPutByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params: OrderPutByIdParams = req.params as any;

    const order = await getRepository(Order).findOne({ id: params.id });
    if (!order) return sendError(404, 'post not found', next);

    const body: OrderPutByIdBody = req.body;


    const address = getAddressStringByOrder(body);
    const orderLoactionArray = await geoCodeing(address);
  
    let zoneId = -1;
    let placeId = '';
    if (orderLoactionArray.length !== 0) {
      const orderLoactionJson = orderLoactionArray[0];
      const zone = await findZoneByGooglePosition(orderLoactionJson)
      if (zone) {
        zoneId = zone.id;
      }
      placeId = orderLoactionJson.place_id;
    } else {
      console.log("haven't found location by Google");
    }

    const newOrder = { ...body, id: order.id, zoneId, placeIdInGoogle: placeId };
    await getRepository(Order).save(newOrder);

    res.status(200).json({ id: order.id });
  } catch (err) {
    console.log('putById Error', err);
  }
}
