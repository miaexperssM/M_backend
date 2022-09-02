import { Order } from 'api/order/order.entity';
import { Zone } from 'api/zone/zone.entity';
import { getConnection } from 'typeorm';

export function isInPolygon(checkPoint, polygonPoints) {
  let counter = 0;
  let i;
  let xinters;
  let p1, p2;
  let pointCount = polygonPoints.length;
  p1 = polygonPoints[0];

  for (i = 1; i <= pointCount; i++) {
    p2 = polygonPoints[i % pointCount];

    if (checkPoint.lat > Math.min(p1.lat, p2.lat) && checkPoint.lat <= Math.max(p1.lat, p2.lat)) {
      if (checkPoint.lng <= Math.max(p1.lng, p2.lng)) {
        if (p1.lat !== p2.lat) {
          xinters = ((checkPoint.lat - p1.lat) * (p2.lng - p1.lng)) / (p2.lat - p1.lat) + p1.lng;
          if (p1.lng === p2.lng || checkPoint.lng <= xinters) {
            counter++;
          }
        }
      }
    }
    p1 = p2;
  }
  if (counter % 2 === 0) {
    return false;
  } else {
    return true;
  }
}

export async function findZoneByGooglePosition(positionJsonByGoogle: any, zoneListData?: any[]) {
  const zoneList =
    zoneListData ||
    (await getConnection()
      .createQueryBuilder()
      .select('zone')
      .from(Zone, 'zone')
      .orderBy('id', 'DESC')
      .getMany());

  const lat = positionJsonByGoogle.geometry.location.lat;
  const lng = positionJsonByGoogle.geometry.location.lng;

  const latlng = { lat, lng };

  const zone = zoneList
    .filter(zone => !zone.isDeleted)
    .map(zone => {
      const pointsArray = zone.points.split('_');
      const point = pointsArray.map(point => {
        const location = point.split(',');
        const gps = { lat: parseFloat(location[0]), lng: parseFloat(location[1]) };
        return gps;
      });
      const zoneData = { ...zone, points: point };
      return zoneData;
    })
    .find(zone => {
      const points = zone.points;
      const isIn = isInPolygon(latlng, points);
      if (isIn === true) {
        console.log('find zone: ', zone.id);
      }
      return isIn;
    });
  if (zone) {
    console.log('GOT A ZONE');
    return zone;
  } else {
    console.log('GOT NO ZONE');
    return undefined;
  }
}

export function getAddressStringByOrder(order: any) {
  return `${order.address || ''}, ${order.comuna || ''}, ${order.destinationCountry || ''}`;
}
