import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { getAddressStringByOrder } from 'utils/calculationHelper';
import sendError from 'utils/error';
import { getLevel1ResultAction } from '../action/sortPick.getLevel1Func';
import { getLevel2ResultAction } from '../action/sortPick.getLevel2Func';

interface GetResultByTrackingNumberParams {
  trackingNumber: string;
}

enum status {
  OK = 'OK',
  Fail = 'Fail',
}

interface resultJson {
  status: status;
  pickingLevel: number;
  message: string;
  address: string | undefined;
  zoneTitle?: string | undefined;
  route: number;
}

export async function getLevel1ResultByTrackingNumberHandler(req: Request, res: Response, next: NextFunction) {
  const params: GetResultByTrackingNumberParams = req.params as any;

  const result = await getLevel1ResultAction(params.trackingNumber);
  console.log(JSON.stringify(result))
  if (result.order == undefined) {
    const json: resultJson = {
      status: status.Fail,
      pickingLevel: 1,
      message: `Not found order by ${params.trackingNumber}, Resaon: ${result.reason}`,
      address: '',
      route: result.port,
    };
    res.status(200).json(json);
  } else if (result.port) {
    const json: resultJson = {
      status: status.OK,
      pickingLevel: 1,
      message: `Get ${params.trackingNumber} sortPick route at ${result.port}, Reason:${result.reason}`,
      address: getAddressStringByOrder(result.order),
      route: result.port,
    };
    res.status(200).json(json);
  } else {
    return sendError(400, 'Unknown error in Level 1', next);
  }
}

export async function getLevel2ResultByTrackingNumberHandler(req: Request, res: Response, next: NextFunction) {
  const params: GetResultByTrackingNumberParams = req.params as any;

  const result = await getLevel2ResultAction(params.trackingNumber);

  if (result.order == undefined) {
    const json: resultJson = {
      status: status.Fail,
      pickingLevel: 2,
      message: `Not found order by ${params.trackingNumber}, Resaon: ${result.reason}`,
      address: '',
      zoneTitle: '',
      route: result.port,
    };
    res.status(200).json(json);
  } else if (result.port) {
    const zone = await getRepository(Zone).findOne({ id: result.order.zoneId, isDeleted: false });
    const json: resultJson = {
      status: status.OK,
      pickingLevel: 2,
      message: `Get ${params.trackingNumber} sortPick route at ${result.port}, Resaon: ${result.reason}`,
      address: getAddressStringByOrder(result.order),
      zoneTitle: zone?.title || "",
      route: result.port,
    };
    res.status(200).json(json);
  } else {
    return sendError(400, 'Unknown error in Level 2', next);
  }
}
