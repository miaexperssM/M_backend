import { Account } from 'api/account/account.entity';
import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { concat } from 'joi';
import { getRepository } from 'typeorm';

interface gpsLocation {
  lng: number;
  lat: number;
}

interface PostZoneBody {
  title: string;
  description: string;
  points: gpsLocation[];
}

export async function postZoneHandler(req: Request, res: Response, next: NextFunction) {
  const body: PostZoneBody = req.body;

  const pointsStr = body.points
    .map(point => {
      const pointStr = `${point.lat.toString()},${point.lng.toString()}`;
      return pointStr;
    })
    .join('_');

  const newZone = getRepository(Zone).create({
    title: body.title,
    description: body.description,
    points: pointsStr,
    account: { id: req.user.id } as Account,
    createdBy: req.user.id,
    inChargeBy: req.user.id
  });
  const zone = await getRepository(Zone).save(newZone);

  res.status(201).json({ id: zone.id });
}
