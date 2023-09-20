# ChaseTheMoonlite Backend Docs

Swagger link: localhost:8080/doc
## Open terminal 

* open `terminal` command window "cmd"

## Postgres db setup

Install `pgAdmin4` (download latest version) : 
https://www.pgadmin.org/download/pgadmin-4-windows/


Make sure to have `psql` command in PATH

### 1. 
![Alt text](screenshots/open.png)

### 2.
![Alt text](screenshots/edit.png) 

### 3. 
![Alt text](screenshots/add.png)

`C:\Program Files\PostgreSQL\15\bin` it is path from PostgresSQL folder. You should find your own path and paste.

Create Admin User with name `postgres` (it should be created automatically and you should only provide password): 

`In terminal`:
* log in to your postgres account using command `psql -U postgres`
* provide password (make up your own password)- password wont be visible

![Alt text](screenshots/password.png)


### Execute below commands in `terminal:`
* `create database ctm;` -> Create database with name ctm
* `create user ctmadmin with encrypted password 'changeitlater';` -> Create user `ctmadmin` with password `changeitlater`
* `grant all privileges on database ctm to ctmadmin;` -> Grant accesses for user
* `alter database ctm owner to ctmadmin;` -> Make ctmadmin an owner of this db
* `alter user ctmadmin with superuser;` 
* `\q` -> End psql session as `postgres` user
* `psql -d ctm -U ctmadmin;` -> log in as ctmadmin

## Importing .sql schema

Database schema is present in directory: src/db/schemas
- Using `terminal`

![Alt text](screenshots/path.png)

`psql -d ctm -U ctmadmin -f ctmschema.sql` <- ctmschema.sql should be a directory of schema

![Alt text](<screenshots/ctmschema in terminal.png>)

- Open pgAdmin4

![screen](https://i.postimg.cc/xdP33VtQ/PGADMIN.png)

## Exporting .sql schema

- open terminal
- change directory to root directory of ctm-nft-backend
- `pg_dump -U postgres --schema-only ctm > ctmschema.sql` execute command to create schema.sql file
-  ![Alt text](screenshots/path2.png)
-  ![Alt text](screenshots/schema-terminal.png)

- Now database should be set up correctly


# Setting up backend

open terminal and go to root directory of project
- install all dependencies using command `yarn install`

## In `.env` file
![Alt text](screenshots/env.png)  
![Alt text](<screenshots/env inside.png>)

### Thirdweb

- to build your contract run in terminal `npx thirdweb build`  
![Alt text](<screenshots/thirdweb build.png>)
- deploy contract smart contract run interminal `npx thirdweb deploy`  
![Alt text](<screenshots/thirdweb deploy.png>)
- go to the link provided (marked in red above) 
- connect wallet   
![Alt text](screenshots/thirdweb_contract.png)
- fill the field - remember use wallet address provided in env file as admin wallet  
![Alt text](screenshots/thirdweb_deploy2.png)  
- go to contracts to see your deployed contract
![Alt text](screenshots/contract.png)

## How to run server

First - please make sure that database is up and running. With the schema provided in this project directory

- Enter project directory

`cd path_to_directory`

- Install all dependencies

`npm install`

- Run prisma command

`npx prisma generate`

- Run server (it runs on port 8080)

`npm start`