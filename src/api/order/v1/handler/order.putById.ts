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
import { autoSuggest, searchAddressByARCGIS } from 'utils/mapServices/ArcGisService';

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
  height: number;
  width: number;
  length: number;
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
    if (
      body.destinationCountry === order.destinationCountry &&
      body.region === order.region &&
      body.province === order.province &&
      body.comuna === order.comuna &&
      body.address === order.address
    ) {
      order.MAWB = body.MAWB;
      order.containerNumber = body.containerNumber;
      order.trackingNumber = body.trackingNumber;
      order.shipper = body.shipper;
      order.shipperPhoneNumber = body.shipperPhoneNumber;
      order.shipperAddress = body.shipperAddress;
      order.recipient = body.recipient;
      order.RUT = body.RUT;
      order.recipientPhoneNumber = body.recipientPhoneNumber;
      order.recipientEmail = body.recipientEmail;

      order.weight = body.weight;
      order.height = body.height;
      order.length = body.length;
      order.width = body.width;
      order.value = body.value;
      order.description = body.description;
      order.quantity = body.quantity;

      const newOrder = await getRepository(Order).save(order);

      res.status(201).json(newOrder);
    } else {
      const suggestAddress = await autoSuggest(body.address, body.comuna, body.province, body.destinationCountry);
      const address = suggestAddress == undefined ? getAddressStringByOrder(body) : suggestAddress;

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

      order.MAWB = body.MAWB;
      order.containerNumber = body.containerNumber;
      order.trackingNumber = body.trackingNumber;
      order.shipper = body.shipper;
      order.shipperPhoneNumber = body.shipperPhoneNumber;
      order.shipperAddress = body.shipperAddress;
      order.destinationCountry = body.destinationCountry;
      order.recipient = body.recipient;
      order.RUT = body.RUT;
      order.recipientPhoneNumber = body.recipientPhoneNumber;
      order.recipientEmail = body.recipientEmail;
      order.region = body.region;
      order.province = body.province;
      order.comuna = body.comuna;
      order.address = body.address;
      order.weight = body.weight;
      order.height = body.height;
      order.length = body.length;
      order.width = body.width;
      order.value = body.value;
      order.description = body.description;
      order.quantity = body.quantity;
      order.createdBy = req.user.id;
      order.placeIdInGoogle = placeId;
      order.zoneId = zoneId;
      order.location = locationStr;
      order.isManualZoneSelection = false;

      const newOrder = await getRepository(Order).save(order);

      res.status(201).json(newOrder);
    }
  } catch (err) {
    console.log('putById Error', err);
  }
}
