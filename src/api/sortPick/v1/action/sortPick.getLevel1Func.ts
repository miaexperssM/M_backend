import { Order } from 'api/order/order.entity';
import { SortPick } from 'api/sortPick/sortPick.entity';
import { getRepository } from 'typeorm';

export async function getLevel1ResultAction(trackingNumber: string) {
  const rulesList = await getRepository(SortPick).find({ pickLevel: 1, isDeleted: false });
  const orderResult = await getRepository(Order).findOne({ trackingNumber, isDeleted: false });

  if (orderResult !== undefined) {
    console.log("start")

    if (orderResult.comuna == undefined || orderResult.comuna == '') {
      const body = { port: 12, order: orderResult, reason: `Comuna information not correct` }
      return await Promise.resolve(body);
    }

    const filterByComunaList = rulesList.filter(rule => {
      const goal = new RegExp(orderResult.comuna, 'gi');
      const matchResult = rule.comunaName.match(goal);
      if (matchResult == null || matchResult.length !== 1) {
        return false;
      } else {
        return true;
      }
    });

    if (filterByComunaList.length !== 1) {
      return await Promise.resolve({
        port: 12,
        order: orderResult,
        reason: `Found ${filterByComunaList.length} routes in result`,
      });
    } else {
      const body = { port: filterByComunaList[0].port, order: orderResult, reason: `OK` }
      console.log("body", body)
      return await Promise.resolve(body);
    }
  } else {
    return await Promise.resolve({ port: 12, order: undefined, reason: `Not found order` });
  }
}
