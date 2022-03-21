# TypeScript Express Mysql Project

> 🚀 TypeScript Express Mysql Project

## Getting Started

### Set Environments

```sh
> cp .env.example .env
> vi .env
```

### Run as Docker

> on Windows

```
> ./scripts/deploy-docker.bat
```

> on Unix-based Systems

```
> ./scripts/deploy-docker.sh
```

### Tech Stack

| Category       | Name           |
| -------------- | -------------- |
| Language       | **TypeScript** |
| JS Runtime     | **Node**       |
| Web Framework  | **Express**    |
| Database       | **MySQL**      |
| ORM            | **TypeORM**    |
| Test Framework | **Jest**       |
| Authentication | **JWT**        |
| Linter         | **TSLint**     |
| Formatter      | **Prettier**   |

### Routing Example

**`POST /api/v1/posts`**

```ts
{
  path: '/posts',
  method: 'post',
  auth: true,
  permission: ['admin'],
  upload: fileUpload.single('attachment'),
  validator: postPostValidator,
  handler: postPostHandler,
}
```

Manage all options in one object. auth, permission, upload, validator, and handler are processed in the order.

### Generating Migration

- Auto generate : **`npm run typeorm migration:generate -- -n <migration-name>`**
- Create empty file : **`npm run typeorm migration:create -- -n <migration-name>`**
- Run migration : **`npm run typeorm migration:run`**
- Revert migration : **`npm run typeorm migration:revert`**

## Project Structure

### API Directory

```
api
├── post
|  ├── post.entity.ts
|  └── v1
|     ├── handler
|     |  ├── post.delById.ts
|     |  ├── post.getAll.ts
|     |  ├── post.getById.ts
|     |  ├── post.getFilesById.ts
|     |  ├── post.post.ts
|     |  └── post.putById.ts
|     ├── index.ts
|     ├── post.route.ts
|     ├── post.test.ts
|     └── post.validator.ts
└── account
   ├── account.entity.ts
   ├── v1
   |  ├── action
   |  |  └── account.getTokenById.ts
   |  ├── handler
   |  |  ├── account.getToken.ts
   |  |  ├── account.postSignIn.ts
   |  |  └── account.postSignUp.ts
   |  ├── index.ts
   |  ├── account.route.ts
   |  ├── account.test.ts
   |  └── account.validator.ts
   └── v2
```

There are collection directories within API. Each collection contains **`<collection-name>.entity.ts`** and different files(**`route` `validator` `handler` `action` `test`**) for each version. Action is a function that makes code duplicated in a handler.<br />
If you create a route in the **`v1`**, **`v2`** directories, the endpoint is automatically prefixed with **`v1`**, **`v2`**.

### Other Directories

```
src
├── app.ts
├── server.ts
├── config
|  ├── environments.ts
|  ├── errorHandlers.ts
|  ├── middlewares.ts
|  └── routes.ts
├── migrations
|  └── <timestamp>-<migraion-name>.ts
├── types
|  ├── error.d.ts
|  ├── route.d.ts
|  └── user.d.ts
└── utils
   ├── entity.ts
   ├── error.ts
   ├── logger.ts
   └── upload.ts
```

Other directories contain app configuration, db migration, typescript declaration and utility files. **`Config`** is a directory of files to set up before listening to the express app, but **`utils`** directory contains utilities used in various places. And **`types`** directory contains the declares used by most collections.
# M_backend
