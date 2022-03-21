import { fileUpload } from 'utils/upload';
import { zoneDelByIdHandler } from './handler/zone.delById';
import { zoneGetAllHandler } from './handler/zone.getAll';
import { zoneGetByIdHandler } from './handler/zone.getById';
import { postZoneHandler } from './handler/zone.post';
import { zonePutByIdHandler } from './handler/zone.putById';
import {
  zoneDelByIdValidator,
  zoneGetAllValidator,
  zoneGetByIdValidator,
  zonePostValidator,
  zonePutByIdValidator,
} from './zone.validator';

export const routes: CommonRoute[] = [
  {
    path: '/zones',
    method: 'get',
    auth: true,
    validator: zoneGetAllValidator,
    handler: zoneGetAllHandler,
  },
  {
    path: '/zones/:id',
    method: 'get',
    auth: true,
    validator: zoneGetByIdValidator,
    handler: zoneGetByIdHandler,
  },
  {
    path: '/addzone',
    method: 'post',
    auth: true,
    validator: zonePostValidator,
    handler: postZoneHandler,
  },
  {
    path: '/zones/:id',
    method: 'put',
    auth: true,
    validator: zonePutByIdValidator,
    handler: zonePutByIdHandler,
  },
  {
    path: '/zones/:id',
    method: 'delete',
    auth: true,
    validator: zoneDelByIdValidator,
    handler: zoneDelByIdHandler,
  },
];
