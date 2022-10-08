import { Order } from 'api/order/order.entity';
import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection, getRepository } from 'typeorm';
import {
  findZoneByPlaceLocation,
  getAddressStringByOrder,
  getCountryCodeByOrder,
  isInPolygon,
} from 'utils/calculationHelper';
import sendError from 'utils/error';
import { geoCodeingByGoogle } from 'utils/googleService';
import { geoCodeingByHERE } from 'utils/hereService';

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
  address: string;
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

  const address = getAddressStringByOrder(body);
  const countryCode = getCountryCodeByOrder(body);

  let zoneId = -1;
  let placeId = '';
  let locationStr = '';

  //  ================     Google Service      ==================
  const orderLoactionArray = await geoCodeingByGoogle(address, countryCode);
  if (orderLoactionArray.length !== 0) {
    const orderLoactionJson = orderLoactionArray[0];
    const zone = await findZoneByPlaceLocation(orderLoactionJson.geometry.location);
    if (zone) {
      zoneId = zone.id;
    }
    placeId = orderLoactionJson.place_id;
    locationStr = JSON.stringify(orderLoactionJson)
  } else {
    console.log("haven't found location by Google");
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
    queryedCount: 0,
  });
  const order = await getRepository(Order).save(newOrder);

  res.status(201).json(order);
}

export async function orderPostListHandler(req: Request, res: Response, next: NextFunction) {
  const bodyList: OrderPostBody[] = req.body;
  const zoneList = await getConnection()
    .createQueryBuilder()
    .select('zone')
    .from(Zone, 'zone')
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .getMany();
  const successIdList = [];
  const errorTrackingNumberList = [];
  bodyList.map(async body => {
    const trackingNumber = body.trackingNumber;

    const alreadyTrackingNumber = await getRepository(Order).findOne({ trackingNumber, isDeleted: false });
    if (alreadyTrackingNumber) {
      errorTrackingNumberList.push({ trackingNumber: body.trackingNumber, reason: 'TrackingNumber already in use' });
      return;
    }

    const address = getAddressStringByOrder(body);
    const countryCode = getCountryCodeByOrder(body);

    let zoneId = -1;
    let placeId = '';
    let locationStr = '';

    //  ================     Google Service      ==================

    const orderLoactionArray = await geoCodeingByGoogle(address, countryCode);
    if (orderLoactionArray.length !== 0) {
      const orderLoactionJson = orderLoactionArray[0];
      const zone = await findZoneByPlaceLocation(orderLoactionJson.geometry.location, zoneList);
      if (zone) {
        zoneId = zone.id;
      }
      placeId = orderLoactionJson.place_id;
      locationStr = JSON.stringify(orderLoactionJson)
    } else {
      console.log("haven't found location by Google");
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
      queryedCount: 0,
      location: locationStr,
    });
    const order = await getRepository(Order).save(newOrder);
    successIdList.push(order.id);
  });

  res.status(201).json({ successIdList, errorTrackingNumberList });
}
