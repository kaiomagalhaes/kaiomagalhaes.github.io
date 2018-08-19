---
canonical: https://www.codelitt.com/blog/automated-deployments-with-circle-docker/
subtitle: Automated deployments with Circle and Docker
---

Automate your deployments with CircleCI, Docker and a Linux server.
TL;DR [go to the tutorial](#soletsgo)

Here at Codelitt, we believe that a fast feedback loop is the best way to ensure that we deliver great products. Since the client has deep market knowledge, we want their validation through each step in the process of bringing a product to life. This feedback loop starts before development begins, and goes on until the product is delivered, with no breaks in between. Working this way allows us to minimize the time required to make further changes, as we rarely need to “go back and change everything”.

In this tutorial, we are using AWS, but it will work with any Linux web server. First, a small description about the 3 main tools we are using:

##### CircleCI
 
An integration tool that allows us to spin up a deployment system with a couple clicks, no configuration needed. It offers a safe way to accomplish the four main steps of deployment:
1. Gather dependencies
2. Run tests
3. Run lint
4. Deploy

##### Docker Compose

Compose  is a tool for defining and running multi-container Docker applications. Currently, we are using Docker based container deployments to assure consistency between development and production environments. We’ve been using it for around two years now, and we really love it.

##### Server

This tutorial will work in any Linux Ubuntu 14+ servers.

### So let’s get started!

First, we need to prepare our CircleCI environment variables with our application specificities. Below you see the variable name and a description for each, add them in your CI project with the proper values.

```
DOCKERHUB_COMPANY_NAME
    As we are working with docker we need it in order to prepare the application image path.

DOCKER_EMAIL
    The deploy user dockerhub email   

DOCKER_PASS
    The deploy user dockerhub password   

DOCKER_USER
    The deploy user dockerhub user   

PROD_DATABASE_NAME
    It is the name of your production app's database

PROD_DATABASE_PASSWORD
    It is the password of your production app's database

PROD_DATABASE_USER
    It is the user of your production app's database

PROD_DEPLOY_HOST
    It is the host IP of your production app's server

PROD_DEPLOY_USER
    It is the user of your production app's server

PROJECT_NAME
    Make sure to not use any spaces here, we are going to use it for the image deployments
```

For continuous deployment on your server, you need to make sure that you organize the connection between CircleCI and your server. We recommend using user-key based connections, but you can use use-user password as well. If you are using the user-key one you need to add your private key to your CircleCI project, which you can learn how to do [here.](https://circleci.com/docs/github-security-ssh-keys/)

This is all the configuration you need to do on the CI, from now on everything is done in your project files. For this tutorial we are using a Rails 5 Ruby on Rails project, which happens to be our base project and...it is open source! You can find it [here.](https://github.com/codelittinc/rails-5-base-project)

First let's organize the `circle.yml` file

```
machine:
  ruby:
    version: '2.3.3'
  services:
    - docker
dependencies:
  pre:
    - gem install bundler
database:
  override:
    - sed -i "s/PROJECT_NAME/$PROJECT_NAME/g" config/database.ci.yml
    - mv config/database.ci.yml config/database.yml
    - bundle exec rake db:create db:schema:load --trace

test:
  override:
    - bundle exec rspec
deployment:
  qa:
    branch: /.*/
    commands:
      - cp Dockerfile.production Dockerfile
      - cp env.example .env
      - sed -i "s/POSTGRES_USER=/POSTGRES_USER=$QA_DATABASE_USER/g" .env
      - sed -i "s/POSTGRES_PASSWORD=/POSTGRES_PASSWORD=$QA_DATABASE_PASSWORD/g" .env
      - sed -i "s/DATABASE_NAME=/DATABASE_NAME=$QA_DATABASE_NAME/g" .env
      - docker build -t codelittinc/rails-base-project:latest .
      - docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS
      - docker push codelittinc/rails-base-project:latest
      - sed -i "s/NETWORK_NAME/$DOCKERHUB_COMPANY_NAME/g" bin/deploy.sh
      - sed -i "s/DOCKERHUB_COMPANY_NAME/$DOCKERHUB_COMPANY_NAME/g" config/docker-compose.yml.template bin/deploy.sh
      - sed -i "s/PROJECT_NAME/$PROJECT_NAME/g" config/docker-compose.yml.template bin/deploy.sh
      - sed -i "s/PROJECT_NAME/$PROJECT_NAME/g" config/docker-compose.yml.template bin/deploy.sh
      - NETWORK_NAME=QA_NETWORK_NAME DEPLOY_USER=$QA_DEPLOY_USER DEPLOY_HOST=$QA_DEPLOY_HOST VERSION=latest sh bin/deploy.sh

  production:
    tag: /version-.*/
    commands:
      - cp Dockerfile.production Dockerfile
      - cp env.example .env
      - sed -i "s/POSTGRES_USER=/POSTGRES_USER=$PROD_DATABASE_USER/g" .env
      - sed -i "s/POSTGRES_PASSWORD=/POSTGRES_PASSWORD=$PROD_DATABASE_PASSWORD/g" .env
      - sed -i "s/DATABASE_NAME=/DATABASE_NAME=$PROD_DATABASE_NAME/g" .env
      - docker build -t codelittinc/rails-base-project:$CIRCLE_TAG .
      - docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS
      - docker push codelittinc/rails-base-project:$CIRCLE_TAG
      - sed -i "s/NETWORK_NAME/$DOCKERHUB_COMPANY_NAME/g" bin/deploy.sh
      - sed -i "s/DOCKERHUB_COMPANY_NAME/$DOCKERHUB_COMPANY_NAME/g" config/docker-compose.yml.template bin/deploy.sh
      - sed -i "s/PROJECT_NAME/$PROJECT_NAME/g" config/docker-compose.yml.template bin/deploy.sh
      - sed -i "s/PROJECT_NAME/$PROJECT_NAME/g" config/docker-compose.yml.template bin/deploy.sh
      - NETWORK_NAME=QA_NETWORK_NAME DEPLOY_USER=$PROD_DEPLOY_USER DEPLOY_HOST=$PROD_DEPLOY_HOST VERSION=$CIRCLE_TAG sh bin/deploy.sh
```

In this CircleCI file we are organizing the deployments based on branches. If you do any commit in any branch and push it to the remote repo, it is going to deploy to the QA server, and if you generate a tag it is going to deploy on the production server. *(Note: Normally for our projects, we won't build and deploy upon every commit. We'll set a specific branch designated as the QA branch, a specific branch as staging, and release tags go to prod.)* 

You need to make sure that your tag name matches the branch validation: `/version-.*/` if you use a different pattern just change the regex.

Another important thing to keep in mind is that you need to setup your dockerhub namespace so where you see `codelittinc/rails-base-project` you need to update for your own.

Also, if you check the database section you are going to see that we use a special database.yml, which is necessary because we need to deploy with this same file, which has the following content and should be placed at `config/database.ci.yml`

```
default: &default
  adapter: postgresql
  encoding: unicode
  host: localhost
  pool: 5
  user: postgres
  password: postgres

development:
  <<: *default
  database: rails-base-test

test:
  <<: *default
  database: rails-base-test

production:
  <<: *default
  host: PROJECT_NAME-db
  database: <%= ENV['DATABASE_NAME'] %>
  password: <%= ENV['POSTGRES_PASSWORD'] %>
  user: <%= ENV['POSTGRES_USER'] %>
```


For both deployments, we generate a Docker image, which we build and push to Docker Hub ( see? here is where we are using those credentials ). After pushing the image, we run a deploy.sh file, which has the following content:

```
#!/usr/bin/env bash

echo "inserting the image version in docker-compose template"
bash -c 'sed -i "s/DOCKERHUB_COMPANY_NAME\/PROJECT_NAME/DOCKERHUB_COMPANY_NAME\/PROJECT_NAME:$VERSION/" config/docker-compose.yml.template'

echo "creating projects folder if it doesn't exist"
ssh $DEPLOY_USER@$DEPLOY_HOST 'mkdir -p projects/PROJECT_NAME/config'

echo "copying docker-compose"
scp config/docker-compose.yml.template $DEPLOY_USER@$DEPLOY_HOST:projects/PROJECT_NAME/config/docker-compose.yml.backend

echo "copying env file"
scp .env $DEPLOY_USER@$DEPLOY_HOST:projects/PROJECT_NAME/config/.env

echo "pulling latest version of the code"
ssh $DEPLOY_USER@$DEPLOY_HOST "docker-compose -f projects/PROJECT_NAME/config/docker-compose.yml.backend pull PROJECT_NAME"

echo "creating network if needed"
ssh $DEPLOY_USER@$DEPLOY_HOST 'if [ $(docker network ls | grep NETWORK_NAME | wc -l) -gt 0 ]; then echo "network already exists"; else docker network create NETWORK_NAME ; fi'

echo "creating db network if needed"
ssh $DEPLOY_USER@$DEPLOY_HOST 'if [ $(docker ps -a | grep PROJECT_NAME-db | wc -l) -gt 0 ]; then echo "db already exists"; else docker-compose -f projects/PROJECT_NAME/config/docker-compose.yml.backend up -d PROJECT_NAME-db ; fi'

echo "starting the new version"
ssh $DEPLOY_USER@$DEPLOY_HOST 'docker-compose -f projects/PROJECT_NAME/config/docker-compose.yml.backend up -d PROJECT_NAME'

echo "create database if it doesn't exist"
ssh $DEPLOY_USER@$DEPLOY_HOST 'docker exec PROJECT_NAME bundle exec rake db:create'

echo "running migrations"
ssh $DEPLOY_USER@$DEPLOY_HOST 'docker exec PROJECT_NAME bundle exec rake db:migrate'

echo "removing old and unsed images"
ssh $DEPLOY_USER@$DEPLOY_HOST "docker images --filter 'dangling=true' --format '{{.ID}}' | xargs docker rmi"

echo "success!"

exit 0
```


What we did here is:
1. Prepare the environment variables
2. Prepare the Docker-Compose file
3. Deploy the app
4. Create the database if it doesn't exist
5. Run the migrations

In order to have it fully automated, we are using a Docker-Compose file template, which should be located at `config/docker-compose.yml.template` with the following content:

```
version: '2'
services:
  PROJECT_NAME:
    container_name: PROJECT_NAME
    image: DOCKERHUB_COMPANY_NAME/PROJECT_NAME
    env_file:
      - .env

    ports:
      - '3000:3000'

  PROJECT_NAME-db:
    image: postgres
    container_name: PROJECT_NAME-db
    env_file:
      - .env

networks:
  default:
    external:
      name: DOCKERHUB_COMPANY_NAME
```

And now that you have everything set, you can go and focus on what matters, your code. This is just one possible way to automate your builds, we like it because it is simple, fast and you can test/use/adapt it for free. 


