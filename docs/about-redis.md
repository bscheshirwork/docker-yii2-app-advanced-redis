# redis

Представлен оффициальным образом [redis](https://hub.docker.com/_/redis/)

Используется основаный на `alpine`, с указанием тега последнией версии, например `redis:4.0.6-alpine`

Конфиг в `docker-compose.yml` представлен одноимённым сервисом `redis`
```
  redis:
    image: redis:4.0.6-alpine
    command: redis-server /etc/redis/conf.d/redis.conf --requirepass yii2advancedredis
    ports:
      - "6379"
    volumes:
      - ../redis-data:/data
      - ../redis-conf:/etc/redis/conf.d
    depends_on:
      - php-supervisor
```

Для связи с фреймворком используется [yiisoft/yii2-redis](https://github.com/yiisoft/yii2-redis)

Возможное использование: очереди, кэш, сессии.

Настройка внутри приложения сводится к конфигурированию компонента `redis`:
[установка](https://github.com/yiisoft/yii2-redis/blob/master/docs/guide/installation.md)
```
return [
    //....
    'components' => [
        'redis' => [
            'class' => 'yii\redis\Connection',
            'hostname' => 'redis',
            'port' => 6379,
            'database' => 0,
        ],
    ]
];
```
соответственно, в случае использования пароля, нужно указать его в конфиге local
```
return [
    //....
    'components' => [
        'redis' => [
            'password' => 'yii2advancedredis',
        ],
    ]
];
```

> Tip: Для IDE PHPStorm доступен плагин `ledis` для облегчния работы с redis

### Хранение дампов, восстановление при перезапуске контейнера
Для ведения журнала AOF (лог операций) `redis-data/appendonly.aof` необходимо установить ключ режима `Append Only File`
```
    command: redis-server --requirepass yii2advancedredis --appendonly yes
```
[Пример оптимизации настроек](https://ruhighload.com/post/%D0%9E%D0%BF%D1%82%D0%B8%D0%BC%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F+%D0%BD%D0%B0%D1%81%D1%82%D1%80%D0%BE%D0%B5%D0%BA+Redis)  
[О дампах и восстановлении](https://www.8host.com/blog/rezervnoe-kopirovanie-i-vosstanovlenie-dannyx-redis-v-ubuntu-14-04/) 

Снапшоты `redis-data/dump.rdb` делаются по времени. По умолчанию установлены параметры:

    Создать копию, если было хотя бы одно изменение в течение 15 минут (900 секунд);
    Создать копию, если в течение 5 минут (300 секунд) было хотя бы 10 изменений;
    Создать копию, если за минуту было 10 000 изменений.


Для изменения параметров можно использовать пользовательский файл конфига `redis`, который необходимо указать **первым параметром** при запуске
```
    command: redis-server /etc/redis/conf.d/redis.conf --requirepass yii2advancedredis
```

Параметры запуска можно также указать в нём, см.[примеры](https://redis.io/topics/config)  
`redis-conf/redis.conf`
```
# n.b.: Комментарии допустимы только в начале строки!

# Параметры по умолчанию
save 900 1
save 300 10
save 60 10000

# Имя файла
dbfilename dump.rdb
# Включение сжатия
rdbcompression yes

# Включить Append Only File
appendonly yes
# Имя файла
appendfilename "appendonly.aof"
```

### Командная строка

Пример работы с cli для определения рабочих директорий (после docker-compose up -d)
```
$ docker-compose -f /home/dev/projects/docker-yii2-app-advanced-redis/docker-run/docker-compose.yml exec redis redis-cli
127.0.0.1:6379> auth yii2advancedredis
OK
127.0.0.1:6379> CONFIG GET dir
1) "dir"
2) "/data"
127.0.0.1:6379> 
```