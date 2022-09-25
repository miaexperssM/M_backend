import { deleteRuleByIdHandler } from './handler/sortPick.delById';
import {
  getLevel1ResultByTrackingNumberHandler,
  getLevel2ResultByTrackingNumberHandler,
} from './handler/sortPick.getResultByTrackingNumber';
import { getRulesByLevelHandler } from './handler/sortPick.getRules';
import { postMeasureDataHandler } from './handler/sortPick.postMeasureData';
import { postMeasureImageHandler } from './handler/sortPick.postMeasureImage';
import { postRuleHandler } from './handler/sortPick.postRule';
import { putRuleByIdHandler } from './handler/sortPick.putRule';
import {
  getRulesByLevelValidator,
  postRuleValidator,
  deleteRuleByIdValidator,
  putRuleByIdValidator,
  getLevelResultByTrackingNumberValidator,
  postMeasureDataValidator,
  postMeasureImageValidator,
} from './sortPick.validator';

export const routes: CommonRoute[] = [
  // CRUD
  {
    path: '/getRulesByLevel/:level',
    method: 'get',
    auth: true,
    validator: getRulesByLevelValidator,
    handler: getRulesByLevelHandler,
  },
  {
    path: '/postRule',
    method: 'post',
    auth: true,
    validator: postRuleValidator,
    handler: postRuleHandler,
  },
  {
    path: '/rules/:id',
    method: 'delete',
    auth: true,
    validator: deleteRuleByIdValidator,
    handler: deleteRuleByIdHandler,
  },
  {
    path: '/putRule/:id',
    method: 'put',
    auth: true,
    validator: putRuleByIdValidator,
    handler: putRuleByIdHandler,
  },
  // Query by Automatic Equipment
  // 1st level sort and pick -- By comuna
  {
    path: '/sortPick/level/1/:trackingNumber',
    method: 'get',
    auth: true,
    validator: getLevelResultByTrackingNumberValidator,
    handler: getLevel1ResultByTrackingNumberHandler,
  },
  // 2nd level sort and pick -- By zone
  {
    path: '/sortPick/level/2/:trackingNumber',
    method: 'get',
    auth: true,
    validator: getLevelResultByTrackingNumberValidator,
    handler: getLevel2ResultByTrackingNumberHandler,
  },
  // measure data post
  {
    path: '/sortPick/measure',
    method: 'post',
    auth: true,
    validator: postMeasureDataValidator,
    handler: postMeasureDataHandler
  },  
  // measure image post
  {
    path: '/sortPick/image',
    method: 'post',
    auth: true,
    validator: postMeasureImageValidator,
    handler: postMeasureImageHandler
  }

];
