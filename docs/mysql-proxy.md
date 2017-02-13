# mysql-proxy
https://github.com/bscheshirwork/docker-mysql-proxy

# Использование с docker-compose

Без прокси (изначальное состояние)
```
version: '2'

services:
  db:
    image: mysql:8.0.0
    restart: always
    ports:
      - "3306:3306"
    volumes:
      - ../mysql-data/db:/var/lib/mysql #mysql-data
    environment:
      MYSQL_ROOT_PASSWORD: yii2advanced
      MYSQL_DATABASE: yii2advanced
      MYSQL_USER: yii2advanced
      MYSQL_PASSWORD: yii2advanced
```

С добавлением прокси (замена имени сервиса базы)
```
version: '2'

services:
  mysql:
    image: mysql:8.0.0
    restart: always
    expose:
      - "3306" #for service mysql-proxy
    ports:
      - "3307:3306" #for external connection
    volumes:
      - ../mysql-data/db:/var/lib/mysql #mysql-data
    environment:
      MYSQL_ROOT_PASSWORD: yii2advanced
      MYSQL_DATABASE: yii2advanced
      MYSQL_USER: yii2advanced
      MYSQL_PASSWORD: yii2advanced
  db:
    image: bscheshir/mysqlproxy:0.8.5
    expose:
      - "3306" #for service php
    ports:
      - "3308:3306" #for external connection
    restart: always
    volumes: 
      - ../mysql-proxy/main.lua:/opt/main.lua
    environment:
      PROXY_DB_PORT: 3306
      REMOTE_DB_HOST: mysql
      REMOTE_DB_PORT: 3306
      PROXY_LUA_SCRIPT: "/opt/main.lua"
    depends_on:
      - mysql
```

# Вывод в STDOUT
Для `docker-compose up` без демонизации `-d` (`../mysql-proxy/main.lua`)
```
function read_query(packet)
   if string.byte(packet) == proxy.COM_QUERY then
	print(string.sub(packet, 2))
   end
end
```

# Логгирование запросов в файл 

```
...
    volumes:
      - ../mysql-proxy/log.lua:/opt/log.lua
      - ../mysql-proxy/mysql.log:/opt/mysql-proxy/mysql.log
    environment:
      PROXY_DB_PORT: 3306
      REMOTE_DB_HOST: mysql
      REMOTE_DB_PORT: 3306
      PROXY_LUA_SCRIPT: "/opt/log.lua"
...
```

`/mysql-proxy/log.lua` https://gist.github.com/simonw/1039751
```
local log_file = '/opt/mysql-proxy/mysql.log'

local fh = io.open(log_file, "a+")

function read_query( packet )
    if string.byte(packet) == proxy.COM_QUERY then
        local query = string.sub(packet, 2)
        fh:write( string.format("%s %6d -- %s \n", 
            os.date('%Y-%m-%d %H:%M:%S'), 
            proxy.connection.server["thread_id"], 
            query)) 
        fh:flush()
    end
end
```
# Благодарности

https://hub.docker.com/r/zwxajh/mysql-proxy
https://hub.docker.com/r/gediminaspuksmys/mysqlproxy/

# Что плохого может случится?
Если у вас не получается поднять цепочку `mysql` -> `mysql-proxy` -> `external клиент слушающий 0.0.0.0:3308`
проверьте порты у сервиса `mysql` и явно добавьте `expose` этому сервису
```
    expose:
      - "3306" #for service mysql-proxy
```

Возможно, понадобится создать файл лога перед запуском 
 ```touch mysql-proxy/mysql.log```
