# noonmar

![noonmar-logo](https://noonmar.sa/assets/img/logo.png)

## Databse

mongo_db_url=mongodb+srv://badalparnami:Owebest321@cluster0.hrdxm.mongodb.net/alumniXP?authSource=admin&replicaSet=atlas-lxam9m-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true

---

## Various Login Credentials

**_*Local*_**:

1. Frontend: **Customer**: top@yopmail.com, System@123, **Vendor**: example1@example.com, System@123
2. Admin: owebest01@gmail.com, System@123

**_*Stage*_**:

1. Frontend: **Customer**: top@yopmail.com, System@123, **Vendor**: example1@example.com, System@123 /[click Here to visit frontend](https://noonmar.stage04.obdemo.com/)
2. Admin: owebest01@gmail.com, System@123 /[click Here to visit admin](https://noonmar.stage04.obdemo.com/)

**_*Prod*_**:

1. Frontend: **Customer**: top@yopmail.com, System@123, **Vendor**: example1@example.com, System@123 /[click Here to visit frontend](http://noonmar.sa/)

---

## Figma File Url

[Click here to see figma file of noonmar](https://www.figma.com/file/rZ9KKWywWf6L0tL3z2ndAL/product-layout-updates?type=whiteboard&node-id=0-1&t=ubOQOvW3pDzMxQm6-0)

---

## TSoft Url

[Click here to go to TSoft apis](https://www.noonmar.com/rest1/console)\
email: aakashSuranaowebest \
password: Owebest-!@6/326-63@#

---

## Deployment

```js
logon type: normal
host: noonmar.stage04.obdemo.com
user: noonmar
pass: 5S0ZMuiv4YDs3EWN

tar -zcvf updatedcode.tar.gz ./ create
tar -zxvf updatedcode.tar.gz extract

FRONTEND =

NODE_ENV=production npm run build
NODE_ENV=production node server.js

screen -r -d [id] = enter
screen -ls = list
screen -S frontend = new

Backend =

pm2 start app.js -n "server"
pm2 restart 0
pm2 logs

Admin =

npm run build locally, create zip and move to stage and extract
```
