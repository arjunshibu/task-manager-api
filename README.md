# task-manager-api
Task Manager REST API with JWT Authentication, written in Node.js and MongoDB

Live demo is available at http://arjun-task-manager-api.herokuapp.com

### Installation
Configure environments:
```bash
$ cp .env.bak .env && cp .env.bak .env.prod
```
#### Development
```bash
$ docker-compose up
```
Server will be up on port 4000
#### Production
```bash
$ docker-compose -f docker-compose.prod.yml up
```
Server will be up on port 80
### API Endpoints
```
POST /users/signup
POST /users/login
POST /users/me/avatar
GET /users/verify/:token
GET /users/:id/verify
GET /users/logout
GET /users/logout/all
GET /users/me
GET /users/:id/avatar.png
PATCH /users/me
DELETE /users/me
DELETE /users/me/avatar

POST /tasks
GET /tasks
GET /tasks/:id
PATCH /tasks/:id
DELETE /tasks/:id
```
#### Example requests with `cURL`
```bash
$ curl -s  -H 'Content-Type: Application/json' http://localhost:4000/users/signup -X POST -d '{"name":"test", "email":"test@test.com", "password": "testpass"}' | jq
{
  "user": {
    "_id": "5f7dabc80bdc172c169e9442",
    "name": "test",
    "age": 1,
    "email": "test@test.com"
  },
  "status": "Check mail to verify your account"
}
```
```bash
$ curl -s -H 'Content-Type: Application/json' http://localhost:4000/tasks -X GET -H 'Authorization: Bearer YOUR_JWT_TOKEN' | jq
[
  {
    "_id": "5f7daee10bdc172c169e9447",
    "description": "my task",
    "completed": false,
    "createdAt": "2020-10-07T12:04:49.065Z",
    "updatedAt": "2020-10-07T12:04:49.065Z"
  }
]
```
