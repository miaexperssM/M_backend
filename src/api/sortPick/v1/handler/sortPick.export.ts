import { Order } from 'api/order/order.entity';
import { SortPick } from 'api/sortPick/sortPick.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection, getRepository } from 'typeorm';
import sendError from 'utils/error';
import { getLevel1ResultAction } from '../action/sortPick.getLevel1Func';
import { getLevel2ResultAction } from '../action/sortPick.getLevel2Func';
import { getAddressStringByOrder } from 'utils/calculationHelper';
import { Zone } from 'api/zone/zone.entity';

interface ExportSortPickParams {
  startTime: number;
  endTime: number;
}

interface ExportSortPickQueries {
  offset: number;
  limit: number;
  type: string;
}

enum Status {
  OK = 'OK',
  Fail = 'Fail',
}

interface PickingRes {
  pickingLevel: number;
  route: number;
}

interface orderResult {
  barcode: string;
  status: Status;
  address: string;
  message: string;
  zoneTitle: string;
  isManualZoneSelection: boolean;
  picking: [PickingRes, PickingRes];
}

interface resultJson {
  status: Status;
  message: string;
  maxItemCount: number;
  result: orderResult[];
}

export async function exportSortPickHandler(req: Request, res: Response, next: NextFunction) {
  const params: ExportSortPickParams = req.params as any;
  const query: ExportSortPickQueries = req.query as any;

  if (Number.isNaN(Number(params.startTime)) || Number.isNaN(Number(params.endTime))) {
    console.log(typeof params.startTime, typeof params.endTime);
    return sendError(400, 'startTime or endTime type error', next);
  }
  if (query.type !== 'json') {
    return sendError(400, 'export type only support json, please set type=json', next);
  }
  if (Number(params.endTime) - Number(params.startTime) > 1296000000) {
    return sendError(400, 'currently only support get within 15 days data', next);
  }
  if (query.limit === undefined || query.limit === null || query.limit > 5000) {
    return sendError(
      400,
      'limit means the number of orders you want to query, must have and the value should less than 5000',
      next,
    );
  }

  const orderList = await getConnection()
    .createQueryBuilder()
    .select('order')
    .from(Order, 'order')
    .orderBy('id', 'DESC')
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .andWhere('createdAt >= :startT', { startT: new Date(Number(params.startTime)) })
    .andWhere('createdAt <= :endT', { endT: new Date(Number(params.endTime)) })
    .skip(Number(query.offset || 0))
    .take(Math.min(Number(query.limit), 5000))
    .getMany();

  const resultList: orderResult[] = [];

  for (const order of orderList) {
    const r1 = await getLevel1ResultAction(order.trackingNumber);
    const r2 = await getLevel2ResultAction(order.trackingNumber);

    let res: orderResult = {
      barcode: order.trackingNumber,
      status: Status.Fail,
      message: 'Error',
      address: '',
      zoneTitle: '',
      isManualZoneSelection: false,
      picking: [
        { pickingLevel: 1, route: 12 },
        { pickingLevel: 2, route: 12 },
      ],
    };

    const address = getAddressStringByOrder(order);

    if (r1.port) {
      res = {
        barcode: res.barcode,
        status: Status.OK,
        message: `Get ${order.trackingNumber} sortPick Level 1 route at ${r1.port}, Reason:${r1.reason}`,
        address,
        zoneTitle: res.zoneTitle,
        isManualZoneSelection: order.isManualZoneSelection,
        picking: [
          {
            pickingLevel: 1,
            route: r1.port,
          },
          res.picking[1],
        ],
      };
    }

    const zone = await getRepository(Zone).findOne({ id: r2.order.zoneId, isDeleted: false });
    if (r2.port) {
      res = {
        barcode: order.trackingNumber,
        status: Status.OK,
        message: `${res.message}, Get ${order.trackingNumber} sortPick Level 2 route at ${r2.port}, Reason:${r2.reason}`,
        address,
        zoneTitle: zone?.title || '',
        isManualZoneSelection: order.isManualZoneSelection,
        picking: [res.picking[0], { pickingLevel: 2, route: r2.port }],
      };
    }

    resultList.push(res);
  }

  const maxOrderCount = await getConnection()
    .createQueryBuilder()
    .select('order')
    .from(Order, 'order')
    .orderBy('id', 'DESC')
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .andWhere('createdAt >= :startT', { startT: new Date(Number(params.startTime)) })
    .andWhere('createdAt <= :endT', { endT: new Date(Number(params.endTime)) })
    .getCount();

  const resultJsonObj: resultJson = {
    status: Status.OK,
    message: `Get ${orderList.length} orders, return ${resultList.length} order results`,
    maxItemCount: maxOrderCount,
    result: resultList,
  };

  res.status(200).json(resultJsonObj);
}
