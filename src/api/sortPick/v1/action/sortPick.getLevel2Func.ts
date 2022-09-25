import { Order } from 'api/order/order.entity';
import { SortPick } from 'api/sortPick/sortPick.entity';
import { getRepository } from 'typeorm';

export async function getLevel2ResultAction(trackingNumber: string) {
  const rulesList = await getRepository(SortPick).find({ pickLevel: 2, isDeleted: false });
  const orderResult = await getRepository(Order).findOne({ trackingNumber, isDeleted: false });

  if (orderResult !== undefined) {
    if (orderResult.zoneId !== -1) {
      const portList = rulesList.filter(rule => rule.zoneId == orderResult.zoneId);
      if (portList.length !== 1) {
        return await Promise.resolve({ port: 12, order: orderResult, reason: `Found ${portList.length} routes in result` });
      } else {
        return await Promise.resolve({ port: portList[0].port, order: orderResult, reason: `OK` });
      }
    } else {
      return await Promise.resolve({ port: 12, order: orderResult, reason: `Order haven't find exact location` });
    }
  } else {
    return await Promise.resolve({ port: 12, order: undefined, reason: `Not found order` });
  }
}
