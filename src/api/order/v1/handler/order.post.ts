import { Order } from 'api/order/order.entity';
import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection, getRepository } from 'typeorm';
import { findZoneByPlaceLocation, getAddressStringByOrder } from 'utils/calculationHelper';
import sendError from 'utils/error';
import { searchAddressByARCGIS, autoSuggest } from 'utils/mapServices/ArcGisService';

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

  const alreadyTrackingNumber = await getRepository(Order).findOne({ trackingNumber });
  if (alreadyTrackingNumber) return sendError(400, 'TrackingNumber already in use', next);

  // History search

  const historyLocationList = await getRepository(Order).find({
    address: body.address,
    comuna: body.comuna,
    province: body.province,
    isManualZoneSelection: true,
    isDeleted: false,
  });

  if (historyLocationList && historyLocationList.length > 0) {
    // if has history order can be ref
    const historyOrderRef = historyLocationList.sort(
      (a, b) => a.createdAt.getMilliseconds() - b.createdAt.getMilliseconds(),
    )[0];
    const newOrder = getRepository(Order).create({
      ...body,
      createdBy: req.user.id,
      placeIdInGoogle: historyOrderRef.placeIdInGoogle,
      zoneId: historyOrderRef.zoneId,
      location: historyOrderRef.location,
      isManualZoneSelection: true,
      queryedCount: 0,
    });
    const order = await getRepository(Order).save(newOrder);
    res.status(201).json({ ...order, score: 100 });
  } else {
    const suggestAddress = await autoSuggest(body.address, body.comuna, body.province, body.destinationCountry);
    const address = suggestAddress == undefined ? getAddressStringByOrder(body) : suggestAddress;

    let zoneId = -1;
    let placeId = '';
    let locationStr = '';
    let score = 0;

    //  ================     Google Service      ==================
    // const orderLoactionArray = await geoCodeingByGoogle(address, countryCode);
    // if (orderLoactionArray.length !== 0) {
    //   const orderLoactionJson = orderLoactionArray[0];
    //   const zone = await findZoneByPlaceLocation(orderLoactionJson.geometry.location);
    //   if (zone) {
    //     zoneId = zone.id;
    //   }
    //   placeId = orderLoactionJson.place_id;
    //   locationStr = JSON.stringify(orderLoactionJson);
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
        score = orderLoactionJson.score;
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
      queryedCount: 0,
    });
    const order = await getRepository(Order).save(newOrder);

    res.status(201).json({ ...order, score });
  }
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

    const alreadyTrackingNumber = await getRepository(Order).findOne({ trackingNumber });
    if (alreadyTrackingNumber) {
      errorTrackingNumberList.push({ trackingNumber: body.trackingNumber, reason: 'TrackingNumber already in use' });
      return;
    }

    const historyLocationList = await getRepository(Order).find({
      address: body.address,
      comuna: body.comuna,
      province: body.province,
      isManualZoneSelection: true,
      isDeleted: false,
    });

    if (historyLocationList && historyLocationList.length > 0) {
      // if has history order can be ref
      const historyOrderRef = historyLocationList.sort(
        (a, b) => a.createdAt.getMilliseconds() - b.createdAt.getMilliseconds(),
      )[0];
      const newOrder = getRepository(Order).create({
        ...body,
        createdBy: req.user.id,
        placeIdInGoogle: historyOrderRef.placeIdInGoogle,
        zoneId: historyOrderRef.zoneId,
        location: historyOrderRef.location,
        isManualZoneSelection: true,
        queryedCount: 0,
      });
      const order = await getRepository(Order).save(newOrder);
      successIdList.push(order.id);
    } else {
      const suggestAddress = await autoSuggest(body.address, body.comuna, body.province, body.destinationCountry);
      const address = suggestAddress == undefined ? getAddressStringByOrder(body) : suggestAddress;

      let zoneId = -1;
      let placeId = '';
      let locationStr = '';
      let score = 0;

      //  ================     Google Service      ==================

      // const orderLoactionArray = await geoCodeingByGoogle(address, countryCode);
      // if (orderLoactionArray.length !== 0) {
      //   const orderLoactionJson = orderLoactionArray[0];
      //   const zone = await findZoneByPlaceLocation(orderLoactionJson.geometry.location, zoneList);
      //   if (zone) {
      //     zoneId = zone.id;
      //   }
      //   placeId = orderLoactionJson.place_id;
      //   locationStr = JSON.stringify(orderLoactionJson)
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
          const zone = await findZoneByPlaceLocation(lnglat, zoneList);
          if (zone) {
            zoneId = zone.id;
          }
          score = orderLoactionJson.score;
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
        queryedCount: 0,
        location: locationStr,
      });
      const order = await getRepository(Order).save(newOrder);
      successIdList.push(order.id);
    }
  });

  res.status(201).json({ successIdList, errorTrackingNumberList });
}
