
Для запуска данного шаблона необходимы [docker](https://docs.docker.com/engine/getstarted/step_one/) и [docker-compose](https://docs.docker.com/compose/install/)
> Обратите вниимание на особенности установки - apt не позволяет добыть нужные версии 

Ниже приведу последовательность действий для запуска на Ubuntu

1.Установить docker и docker-compose по ссылкам выше.

2.Создать папку проекта 

```
$ git clone https://github.com/bscheshirwork/docker-yii2-advanced-rbac newproject
```

либо вручную, если отсутствует git - из [архива](https://github.com/bscheshirwork/docker-yii2-advanced-rbac/archive/master.zip)
В ней `[docker-compose.yml](./docker-run/docker-compose.yml)` служит для установки конфигурации Вашей будущей связки сервисов. Для дебага не забудьте изменить соответствующую переменную окружения, подставив адрес вашей машины вместо указанного для примера.

3.Загрузить и запустить сервис `php`
> Если Вы хотите запустить на одной машине несколько копий такой сборки - обратите внимани на то, чтобы папки (и соответственно префикс композиции, в примере "dockerrun_") имели разное название. Также переменные окружения для mysql необходимо дифференцировать по проектам. Несоблюдение данного правила будет приводить к ошибкам подключения к базе. 

```
$ cd newproject/docker-run
$ docker-compose run php /bin/bash
Creating network "dockerrun_default" with the default driver
Creating dockerrun_db_1
root@abfe3b3ca645:/var/www/html#
```

дальнейшие команды будут выполнятся из консоли этого контейнера:
```
root@abfe3b3ca645:/var/www/html#
```
> Одиночные команды можно выполнить и без этого
`docker-compose -f docker-run/docker-compose.yml run --rm php composer update`

4.Загрузить зависимости `composer` в контейнере. Обнление потребует github token (см. [установку yii2](https://github.com/yiisoft/yii2/blob/master/docs/guide-ru/start-installation.md) ), его вы можете найти на своей странице в разделе `https://github.com/settings/tokens`

```
composer update
```

5.Инициализировать шаблон скриптом, аналогично исходному [шаблону advanced](https://github.com/yiisoft/yii2-app-advanced/blob/master/docs/guide/README.md)

Выберете покружение `dev` в скрипте инициализации 
```
./init
``` 
что создаст настройки и скрипт `yii` для следующего шага. Настройки базы уже установлены для окружения, 
их согласно вашим нуждам можно изменить(`docker-codeception-run/docker-compose.yml`, `docker-run/docker-compose.yml`, `php-code/common/config/main.php` - требуется root).
> Внимание! Возникла ошибка доступа? При изменении настроек базы после её первого запуска не забываем останавливать композицию `docker-compose down` и чистить файлы базы `sudo rm -rf ../mysql-data/*`; Возникла ошибка `SQLSTATE[HY000] [2002] Connection refused` - база не успела поднятся. 

В отличие от исходного шаблона, миграции необходимо выполнить для каждого из модулей 
```
./yii migrate/up --migrationPath=@yii/rbac/migrations/
./yii migrate/up --migrationPath=@dektrium/user/migrations
./yii migrate/up --migrationPath=@mdm/admin/migrations
./yii migrate/up
```

При выполнении последней мигации, согласно [документации модуля](./guide/start-installation.md) вы проведёте инициализацию rbac. **Первый пользователь получит права администратора**.

Создать пользователя можно тут же, командой
```
./yii user/create usermail@usermailserver.com login
```
> В случае ошибки на этапе создания первого пользователя права не будут выданы. Верните базу в первоначальный вид и попробуйте снова.

> email можно прочесть в папке php-code/console/runtime/mail

> Примечание: Для отправки почты (сообщение о регистрации, восстановление пароля, подтверждение ночты в модуле пользователей)
необходимо настроить отправку почты, согласно соответствующему пункту [документации модуля](./guide/start-installation.md)

6.Выйти из контейнера (`exit`, ctrl+c) и запустить комплекс сервисов
```
$ docker-compose up -d
Creating network "dockerrun_default" with the default driver
Creating dockerrun_db_1
Creating dockerrun_php_1
Creating dockerrun_nginx_1
```

Сервис доступен по адресу `0.0.0.0:8080` - frontend, `0.0.0.0:8081` - backend

Для работы с xdebug используются переменные среды.
```
XDEBUG_CONFIG: "remote_host=192.168.0.83 remote_port=9001"
PHP_IDE_CONFIG: "serverName=docker-yii2-advanced-rbac"
```
В PHPStorm настроить следующее:
Добавить сервер с указанным в перемнной PHP_IDE_CONFIG именем
`Settings > Languages & Frameworks > PHP > Servers: [Name => docker-yii2-advanced-rbac]`
В нём изменить path mapping.
`Settings > Languages & Frameworks > PHP > Servers: [Use path mapping => True, /home/user/petshelter/php-code => /var/www/html]`
Изменить порт по умолчанию 9000 на используемый в настройках
`Settings > Languages & Frameworks > PHP > Debug: [Debug port => 9001]`