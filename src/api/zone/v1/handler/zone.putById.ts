import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface ZonePutByIdParams {
  id: number;
}

interface gpsLocation {
  lng: number;
  lat: number;
}

interface ZonePutByIdBody {
  title: string;
  description: string;
  points: gpsLocation[];
}

export async function zonePutByIdHandler(req: Request, res: Response, next: NextFunction) {
  const params: ZonePutByIdParams = req.params as any;

  const zone = await getRepository(Zone).findOne({ id: params.id });
  if (!zone) return sendError(404, 'post not found', next);

  const body: ZonePutByIdBody = req.body;

  const pointsStr = body.points
    .map(point => {
      const pointStr = `${point.lat.toString()},${point.lng.toString()}`;
      return pointStr;
    })
    .join('_');

  zone.title = body.title;
  zone.description = body.description;
  zone.points = pointsStr;

  await getRepository(Zone).save(zone);

  res.status(200).json({ id: zone.id });
}
