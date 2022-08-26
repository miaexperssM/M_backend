import { Order } from 'api/order/order.entity';
import { Zone } from 'api/zone/zone.entity';
import dayjs from 'dayjs';
import { getConnection, getRepository } from 'typeorm';
import { findZoneByGooglePosition } from 'utils/calculationHelper';
import { geoCodeing } from 'utils/googleService';

export async function ZoneSearchReRun() {
  console.log('Start ZoneSearchReRun');
  let count = 0
  const orderList = await getConnection()
    .createQueryBuilder()
    .select('order')
    .from(Order, 'order')
    .orderBy('id', 'DESC')
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .getMany();

  const zoneList = await getConnection()
    .createQueryBuilder()
    .select('zone')
    .from(Zone, 'zone')
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .getMany();

  await Promise.resolve(
    orderList.map(async order => {
      if (dayjs(order.createdAt).isAfter(dayjs('2022-08-19'))) {
          count += 1
        const address = `${order.address}, ${order.region}, ${order.destinationCountry}`;
        const orderLoactionArray = await geoCodeing(address);
        if (orderLoactionArray && orderLoactionArray.length !== 0) {
          const orderLoactionJson = orderLoactionArray[0];
          const zone = await findZoneByGooglePosition(orderLoactionJson, zoneList);
          if (zone) {
            const newOrder = {
              ...order,
              zoneId: zone.id,
              placeIdInGoogle: orderLoactionJson.place_id,
            };
            await getRepository(Order).save(newOrder);
          } else {
            const newOrder = {
              ...order,
              zoneId: -1,
              placeIdInGoogle: orderLoactionJson.place_id,
            };
            await getRepository(Order).save(newOrder);
          }
        }
      }
    }),
  );
  console.log("total count,", count)
}
