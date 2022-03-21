import { fileUpload } from 'utils/upload';
import { orderDelByIdHandler } from './handler/order.delById';
import { orderGetAllHandler } from './handler/order.getAll';
import { orderGetByIdHandler } from './handler/order.getById';
import { orderPostHandler } from './handler/order.post';
import { orderPutByIdHandler } from './handler/order.putById';
import { orderGetByTrackingNumberHandler} from './handler/order.getByTrackingNumber'
import {
  orderDelByIdValidator,
  orderGetAllValidator,
  orderGetByIdValidator,
  orderPostValidator,
  orderPutByIdValidator,
  orderGetByTrackingNumberValidator
} from './order.validator';

export const routes: CommonRoute[] = [
  {
    path: '/orders',
    method: 'get',
    auth: true,
    validator: orderGetAllValidator,
    handler: orderGetAllHandler,
  },
  {
    path: '/orders/:id',
    method: 'get',
    auth: true,
    validator: orderGetByIdValidator,
    handler: orderGetByIdHandler,
  },
  {
    path: '/orders/track/:trackingNumber',
    method: 'get',
    auth: true,
    validator: orderGetByTrackingNumberValidator,
    handler: orderGetByTrackingNumberHandler,
  },
  {
    path: '/addOrder',
    method: 'post',
    auth: true,
    validator: orderPostValidator,
    handler: orderPostHandler,
  },
  {
    path: '/orders/:id',
    method: 'put',
    auth: true,
    validator: orderPutByIdValidator,
    handler: orderPutByIdHandler,
  },
  {
    path: '/orders/:id',
    method: 'delete',
    auth: true,
    validator: orderDelByIdValidator,
    handler: orderDelByIdHandler,
  }
];
