import { Order } from 'api/order/order.entity';
import { SortPick } from 'api/sortPick/sortPick.entity';
import { Zone } from 'api/zone/zone.entity';
import { imageUpload } from 'config/awsS3config';
import { JWT_EXPIRE } from 'config/environments';
import { json, NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { getAddressStringByOrder } from 'utils/calculationHelper';
import sendError from 'utils/error';
import { getLevel1ResultAction } from '../action/sortPick.getLevel1Func';
import { getLevel2ResultAction } from '../action/sortPick.getLevel2Func';

enum status {
  OK = 'OK',
  Fail = 'Fail',
}

interface resultJson {
  status: status;
  pickingLevel: number;
  message: string;
  address: string | undefined;
  zoneTitle?: string
  route: number;
  isManualZoneSelection: boolean
}

interface PostMeasuerImagebody {
  barcode: string;
  image: string;
}

export async function postMeasureImageHandler(req: Request, res: Response, next: NextFunction) {
  const body: PostMeasuerImagebody = req.body;

  const order = await getRepository(Order).findOne({ trackingNumber: body.barcode, isDeleted: false });

  if (order == undefined) return sendError(400, `Not found order by barcode ${body.barcode}`, next);

  const location = imageUpload(body.image, body.barcode)

  order.isImageUploaded = true

  const newOrder = await getRepository(Order).save(order);

  let json1: resultJson = {
    status: status.Fail,
    pickingLevel: 1,
    message: 'Error',
    address: '',
    route: 12,
    isManualZoneSelection: false
  };

  let json2: resultJson = {
    status: status.Fail,
    pickingLevel: 2,
    message: 'Error',
    address: '',
    zoneTitle: '',
    route: 12,
    isManualZoneSelection: false
  };
  const address = getAddressStringByOrder(order);

  const result1 = await getLevel1ResultAction(newOrder.trackingNumber);
  if (result1.port) {
    json1 = {
      status: status.OK,
      pickingLevel: 1,
      message: `Get ${newOrder.trackingNumber} sortPick route at ${result1.port}, Reason:${result1.reason}`,
      address,
      route: result1.port,
      isManualZoneSelection: newOrder.isManualZoneSelection
    };
  }

  const result2 = await getLevel2ResultAction(newOrder.trackingNumber);
  const zone = await getRepository(Zone).findOne({ id: result2.order.zoneId, isDeleted: false });
  if (result2.port) {
    json2 = {
      status: status.OK,
      pickingLevel: 2,
      message: `Get ${newOrder.trackingNumber} sortPick route at ${result2.port}, Reason:${result2.reason}`,
      address,
      zoneTitle: zone?.title || "",
      route: result2.port,
      isManualZoneSelection: newOrder.isManualZoneSelection
    };
  }

  const result = {
    status: status.OK,
    picking: [
      json1,
      json2
    ]
  }

  res.status(201).json(result);
}
