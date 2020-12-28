---
layout: page
title: Sensitive data storage made easy
subtitle: Sensitive data storage made easy
---

Here at Codelitt, our projects range from web applications to robotics to augmented reality. However, inside all of those areas, there is a very important and persistent topic: Security. When you’re thinking about security, there are a lot of factors to think about. Are we talking about server access? Information traffic? Information storage? The list goes on and on and on. Security is always top of mind for us and we just released an enterprise security product, [Boveda](http://www.bovedahq.com), that helps non technical people send sensitive data to others.

Today, I’m going to talk about a really great service that we use to store sensitive data on a server. Vault, is an awesome tool to store key/values that we mainly use for our env variables like API keys and passwords. Vault has really good documentation, [found here](https://www.vaultproject.io/intro/getting-started/install.html).
Let’s learn how to setup a Linux server with Docker and Docker-compose, and utilize Vault.

If you are setting up a new server, take a look at our [server security practices](https://github.com/codelittinc/incubator-resources/blob/master/best_practices/servers.md) and remember to *not* set it up with the root admin.

I also strongly recommend you use  [2factor authentication](https://github.com/kaiomagalhaes/incubator-resources/blob/master/best_practices/servers.md#2-factor-authentication). It’s a bit tricky, but it’s very worth it.

You will need Docker and Docker-compose installed, so if you don't have it take a look at this [great tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-14-04) provided by [Digital Ocean](https://www.digitalocean.com/).

We are going to set it up with the `deploy` user

1 - Before start with the containers let's setup the configuration. Put the following content in `/home/deploy/vault/vault.config`

```
listener "tcp" {
  address = "0.0.0.0:9000"
  tls_disable = 1
}

backend "consul" {
  address = "consul:8500"
  path = "vault"
}
```

2 - As we are using Docker, the initial setup is very simple. We are going to use a Vault image, which you can find the source [here](https://github.com/cgswong/docker-vault). Put the following content in your `docker-compose.yml`

```
version: '2'
services:
  # Vault
  consul:
    container_name: consul
    image: progrium/consul
    restart: always
    hostname: consul
    ports:
      - 8500:8500
    command: "-server -bootstrap"

  vault:
    container_name: vault
    image: cgswong/vault
    restart: always
    volumes:
      - '/home/deploy/vault/vault.config:/root/vault.config'
    ports:
      - 8200:9000
    environment:
      VAULT_ADDR: 'http://0.0.0.0:9000'
    cap_add:
      - IPC_LOCK
    depends_on:
      - consul
    command: "server -config /root/vault.config"
```

We are going to use Consul as our secret back-end, you can find more info about it in the [Vault Docs](https://www.vaultproject.io/docs/secrets/consul/index.html).

3 - Let's run the containers now. run: `docker-compose up -d`

Congratulations! now you have Vault working!

Now to enable it you need to follow the steps below:

1. enter the container with the command
```
docker exec -it vault bash
```
2. run
```
vault init
```


The response should be something like this:

```
bash-4.3# vault init
Unseal Key 1: 6d64855dfbcd93654a191aca77e2863a568a0a6444556958837fd526511f7d5b01
Unseal Key 2: 615ec3594ad1446ed84712d6ff570df0ead89c9a38c13a93f9b0a1286e50ed9c02
Unseal Key 3: 5c2a239676337e6ebd36441ba2cae5de949221d49f3fd6571750324ed51a78a403
Unseal Key 4: 0522dd3c3f4c3a5f2e2f15e53c0b3e114ff6d2e1407d0bc4093cd636702d328c04
Unseal Key 5: 38563df303ae005f4b5e43286196d63f31bc6fafe783e700e7dc4550cb67a7b405
Initial Root Token: 33d9d440-202e-6a0c-7cc8-ccc63aa6f66b

Vault initialized with 5 keys and a key threshold of 3. Please
securely distribute the above keys. When the Vault is re-sealed,
restarted, or stopped, you must provide at least 3 of these keys
to unseal it again.

Vault does not store the master key. Without at least 3 keys,
your Vault will remain permanently sealed.
```

Now before anything else, you should save the unseal keys that you got during the last step, (as without them you can't store or retrieve any key), and make sure to store it in a safe place where no one can access it and that you won't lose for any reason. If you need to send them to an organizational partner you can use [Boveda](https://www.bovedahq.com/).

At this point you should have Vault up and running. Let’s check it’s status. In your browser make sure to replace for your server: `http://yourserver:8200/v1/seal-status`

You should see the response:

```
{
  errors: [
    "Vault is sealed"
  ]
}
```

Which means that it works but it is sealed, let's unseal it.


1. Enter the container with the command
```
docker exec -it vault bash
```
2. Run `vault unseal`
3. It is going to ask for a key, you can pass any of the keys it provided to you before, for each time you need to run `vault unseal`, you need to do it 3 times.

After the third one you will see the response:

```
Sealed: false
Key Shares: 5
Key Threshold: 3
Unseal Progress: 0
```

Which means that now you can store and retrieve keys with safety!

If you already have a secured server you can start saving your keys, otherwise you should go to [this post](https://www.codelitt.com/blog/nginx/) where we teach about how to setup Nginx with free SSL and Docker.

A good security practice for this kind of application is to limit the access to the Vault port to be open to the application that will store/fetch the keys only. In order to do this, you can either user your server application firewall (like aws) or you can run:

`iptables -I PREROUTING 1 -t mangle ! -s your_application_ip -p tcp --dport 9000 -j DROP`

Since most of the data that you plan to store in Vault is probably sensitive, bear in mind that a chain is as strong as its weakest link, so even with Vault if your server isn't properly set up then your information isn't safe.
