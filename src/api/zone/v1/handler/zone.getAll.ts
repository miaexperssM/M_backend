import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';

interface ZonesGetAllQuery {
  offset: number;
  limit: number;
}

export async function zoneGetAllHandler(req: Request, res: Response, next: NextFunction) {
  const query: ZonesGetAllQuery = req.query;

  const zoneList = await getConnection()
    .createQueryBuilder()
    .select('zone')
    .from(Zone, 'zone')
    .orderBy('id', 'DESC')
    .skip(query.offset)
    .take(query.limit)
    .getMany();

  const pointResult = zoneList.filter(zone => !zone.isDeleted).map(zone => {
    const pointsArray = zone.points.split('_');
    const point = pointsArray.map(point => {
      const location = point.split(',');
      const gps = { lat: parseFloat(location[0]), lng: parseFloat(location[1]) };
      return gps;
    });
    const zoneData = {...zone, points:point}
    return zoneData;
  });

  res.status(200).json(pointResult);
}
