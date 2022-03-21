import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface ZoneGetByIdParams {
  id: number;
}

export async function zoneGetByIdHandler(req: Request, res: Response, next: NextFunction) {
  const params: ZoneGetByIdParams = req.params as any;

  const zone = await getRepository(Zone).findOne({ id: params.id });
  if (!zone) return sendError(404, 'post not found', next);

  const pointsArray = zone.points.split('_');
  pointsArray.map(point => {
    const location = point.split(',');
    const gps = { lat: parseFloat(location[0]), lon: parseFloat(location[1]) };
    return gps;
  });

  const newZone = { ...zone, points: pointsArray };

  res.status(200).json(newZone);
}
