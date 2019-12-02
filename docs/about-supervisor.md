# Supervisor


Supervisor — монитор процессов для ОС Linux, он автоматически перезапустит ваши консольные процессы,
если они остановятся. 

Для работы в композиции собраны образы с `supervisor pid=1`  
[yii2-alpine-supervisor](https://github.com/bscheshirwork/docker-php/blob/master/yii2-alpine-supervisor/Dockerfile)  
[yii2-alpine-supervisor-xdebug](https://github.com/bscheshirwork/docker-php/blob/master/yii2-alpine-supervisor-xdebug/Dockerfile)

Параметры использования в приложении описывается сервисом `php-supervisor`  
`docker-run/docker-compose.yml`
```yml
  php-supervisor: # for workers
    image: bscheshir/php:7.4.0-fpm-alpine-4yii2-supervisor-xdebug
    restart: always
    volumes:
      - ../php-code:/var/www/html #php-code
      - ../supervisor-conf:/etc/supervisor/conf.d
      - ../supervisor-logs:/var/log/supervisor
    depends_on:
      - db
    environment:
      TZ: Europe/Moscow
      XDEBUG_CONFIG: "remote_host=dev-Aspire-V3-772 remote_port=9003 var_display_max_data=1024 var_display_max_depth=5"
      PHP_IDE_CONFIG: "serverName=yii2advanced"
```

Конфиги Supervisor находятся в папке `supervisor-conf`:`/etc/supervisor/conf.d`.  
Можно создать любое количество конфигов.   
Логи находятся в папке `supervisor-logs`:`/var/log/supervisor`

Пример конфига:  
`supervisor-conf/yii-queue-worker.conf`

```conf
[program:yii-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=/usr/local/bin/php /var/www/html/yii queue/listen --verbose=1 --color=0
autostart=true
autorestart=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/html/console/runtime/logs/yii-queue-worker.log
```

Этот пример указывает, что Supervisor должен запустить 4 воркера `queue/listen`, наблюдать за ними,
и автоматически перезапускать их если они будут падать. Весь вывод будет писаться в лог.
Больше о воркерах и создании команд см. [about-queue](./about-queue.md)

Подробнее о настройке и использовании Supervisor читайте в [документации](http://supervisord.org).

См. также [пример файла конфиграции](https://gist.github.com/tsabat/1528270)

В корректности запуска можно убедится, вызвав монитор процессов (после docker-composer up -d)
```sh
docker-compose -f /home/dev/projects/docker-yii2-app-advanced-redis/docker-run/docker-compose.yml exec php-supervisor ps
PID   USER     TIME   COMMAND
    1 root       0:00 {supervisord} /usr/bin/python /usr/bin/supervisord --noda
    9 www-data   0:00 /usr/local/bin/php /var/www/html/yii queue/listen --verbo
   10 www-data   0:00 /usr/local/bin/php /var/www/html/yii queue/listen --verbo
   11 www-data   0:00 /usr/local/bin/php /var/www/html/yii queue/listen --verbo
   12 www-data   0:00 /usr/local/bin/php /var/www/html/yii queue/listen --verbo
   13 root       0:00 ps
```

> note: queue/listen недоступна до инициализации приложения и установки через `composer` [yiisoft/yii2-queue](https://github.com/yiisoft/yii2-queue)

при невозможности запуска в логе будут строки вида
```
2017-08-11 17:34:08,541 INFO gave up: yii-queue-worker_03 entered FATAL state, too many start retries too quickly
```
