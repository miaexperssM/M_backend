import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { findZoneByPlaceLocation, getAddressStringByOrder } from 'utils/calculationHelper';
import sendError from 'utils/error';
import { autoSuggest, searchAddressByARCGIS } from 'utils/mapServices/ArcGisService';

interface OrderPutByIdParams {
  id: number;
}

interface OrderPutByIdWithZoneIdBody {
  zoneId: number;
}

export async function orderPutByIdWithZoneIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params: OrderPutByIdParams = req.params as any;

    const order = await getRepository(Order).findOne({ id: params.id });
    if (!order) return sendError(404, 'post not found', next);

    const body: OrderPutByIdWithZoneIdBody = req.body;

    if (body.zoneId >= 0) {
      const newOrder = await getRepository(Order).save({ ...order, zoneId: body.zoneId, isManualZoneSelection: true });
      res.status(201).json(newOrder);
    } else {
      const suggestAddress = await autoSuggest(order.address, order.comuna, order.province, order.destinationCountry);
      const address = suggestAddress == undefined ? getAddressStringByOrder(order) : suggestAddress;

      let zoneId = -1;
      let placeId = '';
      let locationStr = '';
      let score = 0;

      const orderLoactionArray = await searchAddressByARCGIS(address);
      if (orderLoactionArray.length !== 0) {
        const orderLoactionJson = orderLoactionArray[0];
        const lnglat = orderLoactionJson?.Location?.DisplayPosition
          ? {
              lng: orderLoactionJson.Location.DisplayPosition.Longitude,
              lat: orderLoactionJson.Location.DisplayPosition.Latitude,
            }
          : undefined;
        if (lnglat) {
          const zone = await findZoneByPlaceLocation(lnglat);
          if (zone) {
            zoneId = zone.id;
          }
          locationStr = JSON.stringify(orderLoactionJson);
        }
      } else {
        console.log("haven't found location by ArcGIS");
      }
      order.placeIdInGoogle = placeId;
      order.zoneId = zoneId;
      order.location = locationStr;
      order.isManualZoneSelection = false;

      const newOrder = await getRepository(Order).save(order);
      res.status(201).json(newOrder);
    }
  } catch (err) {
    console.log('putByIdWithZoneId Error', err);
  }
}
