import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface ZoneDelByIdParams {
  id: number;
}

export async function zoneDelByIdHandler(req: Request, res: Response, next: NextFunction) {
  const params: ZoneDelByIdParams = req.params as any;

  const zone = await getRepository(Zone).findOne({ id: params.id });
  if (!zone) return sendError(404, 'Zone not found', next);

  zone.isDeleted = true
  await getRepository(Zone).save(zone);

  res.status(200).end();
}
