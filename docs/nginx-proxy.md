# Nginx-proxy

Для разрешения виртуальных серверов можно использовать `nginx-proxy` в той же сети докера.

Создайте дирректорию `nginx-proxy`  и следующую структуру файлов в ней

### `nginx-conf/nginx.conf`
```conf
server {
    listen  80;
    server_name frontend.dev www.frontend.dev;

    access_log  /var/log/nginx/proxy-access.log;
    error_log   /var/log/nginx/proxy-error.log;

    location / {
        proxy_pass http://nginx:8080/;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   Host $http_host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ /\.(ht|svn|git) {
        deny all;
    }
}

server {
    listen  80;
    server_name backend.dev www.backend.dev;

    access_log  /var/log/nginx/proxy-access.log;
    error_log   /var/log/nginx/proxy-error.log;

    location / {
        proxy_pass http://nginx:8081/;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   Host $http_host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ /\.(ht|svn|git) {
        deny all;
    }
}
```

### `docker-compose.yml`
```yml
version: '2'
services:
  nginx-proxy:
    image: nginx:1.17.8-alpine
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx-conf:/etc/nginx/conf.d #nginx-conf
      - ./nginx-logs:/var/log/nginx #nginx-logs
networks:
  default:
    external:
      name: dockeryii2appadvancedredis_default
```

Выполните
```sh
docker-compose -f nginx-proxy/docker-compose.yml up -d 
```
После старта основной композиции `docker-compose up -d`.