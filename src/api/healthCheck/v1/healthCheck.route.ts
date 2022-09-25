import { getHealthCheckHandler } from "./handler/healthCheck.getHealth";

export const routes: CommonRoute[] = [
  {
    path: '/healthCheck',
    method: 'get',
    auth: true,
    handler: getHealthCheckHandler
  }
];
