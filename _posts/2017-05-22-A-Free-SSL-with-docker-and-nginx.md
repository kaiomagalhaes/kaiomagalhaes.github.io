---
title: Free SSL with Docker and NGINX
subtitle: Free SSL with docker and NGINX
---

Here at [Codelitt](https://www.codelitt.com) we use NGINX as our proxy server. We used to install it on the server and run the applications with docker and docker-compose. As we strive to have a configuration that isn't server based now we are using it a bit differently. We now install NGINX inside of a container on a server.

In this post i'm going to show how to config an environment with containerized applications and NGINX as a proxy server.

As we are using Docker containers, we need to start writing the docker-compose. Create a file named `docker-compose.yml` on your server with the following content:

```
version: '2.0'
services:
  nginx:
    image: nginx
    container_name: nginx
    restart: always

    ports:
     - '80:80'
     - '443:443'

    volumes: 
     - /etc/nginx-docker/:/etc/nginx/
```

Some details you may want to know:

1. As we have set the ```restart: always``` If for some reason the server restarts the nginx container will start with it. 

2. We are linking doors `80` and `443` with your server, so every connection to these ports will redirect to the NGINX container.

3. As you can see the configuration files will be on a host folder, here we use: `/etc/nginx-docker` but you can use any other you want.

Inside this folder you need to add the files that you can find [here](https://github.com/kaiomagalhaes/nginx-docker-configuration).

the steps are:

```
git clone https://github.com/kaiomagalhaes/nginx-docker-configuration.git
mkdir -p /etc/nginx-docker/
cp -r nginx-docker-configuration/* /etc/nginx-docker/
rm -rf nginx-docker-configuration/
```

Now going to `/etc/nginx-docker/conf.d/default.conf` you are going to see that the `default.conf` is empty, fill it with the following content:

```
upstream my-application {
  least_conn;
  server app:4000 max_fails=3 fail_timeout=20 weight=10;
}

server {
    listen 80;
    server_name YOUR_SERVER_NAME
    location / {
        proxy_http_version 1.1;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://my-application;
    }
}
```

This is a simple NGINX config, if you check on line 3 you are going to see a host with a port. In this case the `app` is the name of the container of your application. You need to assure that the Nginx container is going to be is on the same docker-compose network of the application and the simplest way is to have everything on the same dockerfile, like:

```
version: '2'
services:
  nginx:
    image: nginx
    container_name: nginx
    restart: always

    ports:
     - '80:80'
     - '443:443'

    links:
      - app

    volumes: 
     - /etc/nginx-docker/:/etc/nginx/

  db:
    image: postgres
    container_name: myapp-db

  app:
    container_name: myapp-app
    stdin_open: true
    build:
      context: /path/to/myappfolder
      dockerfile: Dockerfile.production

    volumes:
      - /path/to/myappfolder:/share

    ports:
      - '3000:3000'

    depends_on:
      - db

    links:
      - db
```

Bear in mind that if your application isn't running on the port `3000` you need to change the docker-compose.yml on the app section. You need to make sure to change the dockerfile path to a real one. If you want an app to test it we have a [Rails 5 base project](https://github.com/codelittinc/rails-5-base-project)

```
docker-compose -f docker-compose.yml up -d
```
Cool, yours containers are up and running!

If you don't need to use SSL you can stop here. Goodbye and [thanks for all the fish](http://img14.deviantart.net/c2f0/i/2013/337/7/4/so_long__and_thanks_for_all_the_fish__by_acidbetta-d6ung6t.jpg).

So if you are still here is because you are a smart person that cares about security, as a reward for your hard work I'm going to teach you how you can get SSL for only 12 installments of 0.00 USD (which is known as free)!

As you are setting up a custom server, we are going to use [Let's Encrypt](https://letsencrypt.org/getting-started/)

Before starting you need to have a domain for the certificate, so if you don't have go ahead and get here, I will be waiting.

Got it? Great! let's follow the steps:

1 - if you have nginx running stop it using `docker stop nginx`
2 - run 
```
# download the installer
wget https://dl.eff.org/certbot-auto
# allow it to be an executable
chmod a+x certbot-auto
# install 
./certbot-auto
```
if you are using ubuntu 14.4 you may have an issue running certbot, if so try  to  export the following variables and run it again:
```
export LC_ALL="en_US.UTF-8"
export LC_CTYPE="en_US.UTF-8"
```

3 - open the 443 port 
```
/sbin/iptables -A INPUT -m state --state NEW -p tcp --dport 443 -j ACCEPT
```

4 - create the nginx certs folder 
```
mkdir /etc/nginx-docker/certs
```

5 - run 
```
./certbot-auto certonly --standalone -d YOUR DOMAIN
```

6 - type your email

7 - decide if you want to share your email or not

8 - copy then to your certs folder, see that you need to update the following path your your server path:
```
cp /etc/letsencrypt/live/YOURSERVER/* /etc/nginx-docker/certs/
```

At this point you have your fresh new certificates, but Nginx don't know that they exist, so lets update the configuration. 

run: 

```
vim /etc/nginx-docker/conf.d/default.conf
```

and update it with the following content:

```
upstream my-application {  
  least_conn;
  server app:3000 max_fails=3 fail_timeout=20 weight=10;
}

server {
    listen 80;
    server_name YOUR_SERVER_NAME
    return 301 https://$host$request_uri;
}

server {
    listen 443 default_server;
    server_name YOUR_SERVER_NAME
    ssl         on;
    ssl_certificate       /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key       /etc/nginx/certs/privkey.pem;

    location / {
        proxy_http_version 1.1;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://my-application;
    }
}

```

Start your nginx server `docker start nginx`

Congratulations! You've finished your SSL configuration.

This is just one of multiple ways to have a SSL certification. It is highly recommended for any kind of web application, it not only makes your site secure, but in addition, it lets your users know that you care about their data.
