# mysql-proxy
https://github.com/bscheshirwork/docker-mysql-proxy

# Использование с docker-compose

Без прокси (изначальное состояние)
```yml
version: '2'

services:
  db:
    image: mysql:8.0.11
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
```yml
version: '2'

services:
  mysql:
    image: mysql:8.0.11
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
      - ../mysql-proxy-conf:/opt/mysql-proxy/conf
    environment:
      PROXY_DB_PORT: 3306
      REMOTE_DB_HOST: mysql
      REMOTE_DB_PORT: 3306
      LUA_SCRIPT: "/opt/mysql-proxy/conf/main.lua"
    depends_on:
      - mysql
```

# Вывод в STDOUT
Для `docker-compose up` без демонизации `-d` (`../mysql-proxy/main.lua`)
```lua
function read_query(packet)
   if string.byte(packet) == proxy.COM_QUERY then
	print(string.sub(packet, 2))
   end
end
```

# Логгирование запросов в файл 

```yml
...
    volumes:
      - ../mysql-proxy-conf:/opt/mysql-proxy/conf
      - ../mysql-proxy-logs:/opt/mysql-proxy/logs
    environment:
      PROXY_DB_PORT: 3306
      REMOTE_DB_HOST: mysql
      REMOTE_DB_PORT: 3306
      LUA_SCRIPT: "/opt/mysql-proxy/conf/log.lua"
      LOG_FILE: "/opt/mysql-proxy/logs/mysql.log"
...
```

`/mysql-proxy-conf/log.lua` https://gist.github.com/simonw/1039751
```lua
local log_file = os.getenv("LOG_FILE")

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

# Ротация логов
Образ может быть расширен для ротации логов с помощью `logrotate`
Конфиг `/etc/logrotate.d/mysql-proxy` (приблизительно)

```conf
/opt/mysql-proxy/mysql.log {
	weekly
	missingok
	rotate 35600
	compress
	delaycompress
	notifempty
	create 666 root root 
	postrotate
		/etc/init.d/mysql-proxy reload > /dev/null
	endscript
}
```

# Что плохого может случится?
Если у вас не получается поднять цепочку `mysql` -> `mysql-proxy` -> `external клиент слушающий 0.0.0.0:3308`
проверьте порты у сервиса `mysql` и явно добавьте `expose` этому сервису
```yml
    expose:
      - "3306" #for service mysql-proxy
```

