import {
  postSignInValidator,
  postSignUpValidator,
  addNewUserValidator,
  modifyUserValidator,
  accountDelByIdValidator,
} from './account.validator';
import { getTokenHandler } from './handler/account.getToken';
import { postSignInHandler } from './handler/account.postSignIn';
import { postSignUpHandler } from './handler/account.postSignUp';
import { getAllUsersHandler } from './handler/account.getAll';
import { addNewUserHandler } from './handler/account.postNewUser';
import { accountPutByIdHandler } from './handler/account.putById';
import { accountDelByIdHandler } from './handler/account.delById';

export const routes: CommonRoute[] = [
  {
    path: '/signup',
    method: 'post',
    validator: postSignUpValidator,
    handler: postSignUpHandler,
  },
  {
    path: '/signin',
    method: 'post',
    validator: postSignInValidator,
    handler: postSignInHandler,
  },
  {
    path: '/token',
    method: 'get',
    auth: true,
    handler: getTokenHandler,
  },
  { path: '/addUser', method: 'post', auth: true, handler: addNewUserHandler, validator: addNewUserValidator },
  {
    path: '/users/:id',
    method: 'put',
    auth: true,
    validator: modifyUserValidator,
    handler: accountPutByIdHandler,
  },
  {
    path: '/users/:id',
    method: 'delete',
    auth: true,
    validator: accountDelByIdValidator,
    handler: accountDelByIdHandler,
  },
  {path: '/users', method: 'get', auth: true, handler: getAllUsersHandler },
];
