# Supervisor


Supervisor — монитор процессов для ОС Linux, он автоматически перезапустит ваши консольные процессы,
если они остановятся. 

Для работы в композиции собраны образы с `supervisor pid=1`  
[yii2-alpine-supervisor](https://github.com/bscheshirwork/docker-php/blob/master/yii2-alpine-supervisor/Dockerfile)  
[yii2-alpine-supervisor-xdebug](https://github.com/bscheshirwork/docker-php/blob/master/yii2-alpine-supervisor-xdebug/Dockerfile)

Конфиги Supervisor находятся в папке `supervisor-conf`:`/etc/supervisor/conf.d`.  
Можно создать любое количество конфигов.   
Логи находятся в папке `supervisor-logs`:`/var/log/supervisor`

Пример конфига:  
`supervisor-conf/yii-queue-worker.conf`

```conf
[program:yii-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=/usr/bin/php /var/www/html/yii queue/listen --verbose=1 --color=0
autostart=true
autorestart=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/html/console/runtime/logs/yii-queue-worker.log
```

Этот пример указывает, что Supervisor должен запустить 4 воркера `queue/listen`, наблюдать за ними,
и автоматически перезапускать их если они будут падать. Весь вывод будет писаться в лог.

Подробнее о настройке и использовании Supervisor читайте в [документации](http://supervisord.org).

См. также [пример файла конфиграции](https://gist.github.com/tsabat/1528270)

Параметры использования в приложении описывается сервисом `php-supervisor`  
`docker-run/docker-compose.yml`
```yml
  php-supervisor: # for workers
    image: bscheshir/php:7.1.8-fpm-alpine-4yii2-supervisor-xdebug
    restart: always
    volumes:
      - ../php-code:/var/www/html #php-code
      - ../supervisor-conf:/etc/supervisor/conf.d
      - ../supervisor-logs:/var/log/supervisor
    depends_on:
      - db
    environment:
      TZ: Europe/Moscow
      XDEBUG_CONFIG: "remote_host=192.168.0.83 remote_port=9003 var_display_max_data=1024 var_display_max_depth=5"
      PHP_IDE_CONFIG: "serverName=yii2advanced"
```

> note: queue/listen недоступна до инициализации приложения и установки через `composer` [yiisoft/yii2-queue](https://github.com/yiisoft/yii2-queue)