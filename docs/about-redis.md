# redis

Представлен оффициальным образом [redis](https://hub.docker.com/_/redis/)

Используется основаный на `alpine`, с указанием тега последнией версии, например `redis:4.0.1-alpine`

Конфиг в `docker-compose.yml` представлен одноимённым сервисом `redis`
```
  redis:
    image: redis:4.0.1-alpine
    command: redis-server --requirepass yii2advancedredis
    ports:
      - "6379"
    volumes:
      - ../redis-data:/data
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