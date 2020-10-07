# task-manager-api
Task Manager REST API with Authentication, written in Node.js

#### Installation
```
$ npm i
```
#### Start MongoDB
```
$ sudo systemctl start mongod
```
#### Start Server
Setup configurations
```
$ mkdir config && touch config/dev.env config/prod.env
```
.env file structure
```
PORT=4000
URL='http://localhost:4000'
MONGODB_URL='mongodb://127.0.0.1:27017/task-manager'
JWT_SECRET='YOUR_JWT_SECRET'
SENDGRID_API_KEY='YOUR_API_KEY'
```
Development mode
```
$ npm run dev
```
Production mode
```
$ npm start
```
### API
Endpoints
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
Example requests with `cURL`
```
$ curl -s http://localhost:4000/users/signup -X POST -H 'Content-Type: Application/json' -d '{"name":"test", "email":"test@test.com", "password": "testpass"}' | jq
{
  "user": {
    "_id": "5f7dabc80bdc172c169e9442",
    "name": "test",
    "age": 1,
    "email": "test@test.com"
  },
  "status": "Check mail to verify your account."
}
```
```
$ curl -s http://localhost:4000/tasks -X GET -H 'Content-Type: Application/json' -H 'Authorization: Bearer YOUR_JWT_TOKEN' | jq
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
### To Do
* Implement XSS Protection
