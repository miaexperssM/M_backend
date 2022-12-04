import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection, getRepository } from 'typeorm';
import {
  findZoneByPlaceLocation,
  getAddressStringByOrder,
  getCountryCodeByOrder,
  isInPolygon,
} from 'utils/calculationHelper';
import sendError from 'utils/error';
import { searchAddressByARCGIS } from 'utils/mapServices/ArcGisService';

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

    let zoneId = -1;
    let placeId = '';
    let locationStr = '';
    //  ================     Google Service      ==================

    // const orderLoactionArray = await geoCodeingByGoogle(address, countryCode);

    // if (orderLoactionArray.length !== 0) {
    //   const orderLoactionJson = orderLoactionArray[0];
    //   const zone = await findZoneByPlaceLocation(orderLoactionJson.geometry.location);
    //   if (zone) {
    //     zoneId = zone.id;
    //   }
    //   locationStr = JSON.stringify(orderLoactionJson)
    //   placeId = orderLoactionJson.place_id;
    // } else {
    //   console.log("haven't found location by Google");
    // }

    //  ================     ARCGIS Service      ==================

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

    //  ================     HERE Service      ==================

    // const placeList = await geoCodeingByHERE(address, countryCode);
    // if (placeList.length !== 0) {
    //   const orderLoactionJson = placeList[0];
    //   const lnglat = orderLoactionJson.Result[0].Location.DisplayPosition
    //     ? {
    //         lng: orderLoactionJson.Result[0].Location.DisplayPosition.Longitude,
    //         lat: orderLoactionJson.Result[0].Location.DisplayPosition.Latitude,
    //       }
    //     : undefined;
    //   if (lnglat) {
    //     const zone = await findZoneByPlaceLocation(lnglat);
    //     if (zone) {
    //       zoneId = zone.id;
    //     }
    //     locationStr = JSON.stringify(orderLoactionJson.Result[0]);
    //   }
    // } else {
    //   console.log("haven't found location by Here");
    // }

    const newOrder = getRepository(Order).create({
      ...body,
      createdBy: req.user.id,
      placeIdInGoogle: placeId,
      zoneId,
      location: locationStr,
    });

    await getRepository(Order).save(newOrder);

    res.status(200).json(newOrder);
  } catch (err) {
    console.log('putById Error', err);
  }
}
