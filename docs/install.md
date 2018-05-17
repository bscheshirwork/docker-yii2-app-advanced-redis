
Для запуска данного шаблона необходимы [docker](https://docs.docker.com/engine/getstarted/step_one/) и [docker-compose](https://docs.docker.com/compose/install/)
> Обратите вниимание на особенности установки - apt не позволяет добыть нужные версии 

Ниже приведу последовательность действий для запуска на Ubuntu

1.Установить docker и docker-compose по ссылкам выше.

2.Создать папку проекта 

```sh
$ git clone https://github.com/bscheshirwork/docker-yii2-advanced-rbac newproject
```

либо вручную, если отсутствует git - из [архива](https://github.com/bscheshirwork/docker-yii2-advanced-rbac/archive/master.zip)
В ней `[docker-compose.yml](./docker-run/docker-compose.yml)` служит для установки конфигурации Вашей будущей связки сервисов. Для дебага не забудьте изменить соответствующую переменную окружения, подставив адрес вашей машины вместо указанного для примера.

3.Загрузить и запустить сервис `php`
> Если Вы хотите запустить на одной машине несколько копий такой сборки - обратите внимани на то, чтобы папки (и соответственно префикс композиции, в примере "dockerrun_") имели разное название. Также переменные окружения для mysql необходимо дифференцировать по проектам. Несоблюдение данного правила будет приводить к ошибкам подключения к базе. 

```sh
$ cd newproject/docker-run
$ docker-compose run php /bin/bash
Creating network "dockerrun_default" with the default driver
Creating dockerrun_db_1
root@abfe3b3ca645:/var/www/html#
```

дальнейшие команды будут выполнятся из консоли этого контейнера:
```sh
root@abfe3b3ca645:/var/www/html#
```
> Одиночные команды можно выполнить и без этого
`docker-compose -f docker-run/docker-compose.yml run --rm php composer update`

4.Загрузить зависимости `composer` в контейнере. Обнление потребует github token (см. [установку yii2](https://github.com/yiisoft/yii2/blob/master/docs/guide-ru/start-installation.md) ), его вы можете найти на своей странице в разделе `https://github.com/settings/tokens`

Кеш композера можно вынести из контейнера, для поддержания его в чистоте и ускорения работы новых контейнеров сервиса `php`
```sh
- ~/.composer/cache:/root/.composer/cache
```

```sh
composer update -vv
```

5.Инициализировать шаблон скриптом, аналогично исходному [шаблону advanced](https://github.com/yiisoft/yii2-app-advanced/blob/master/docs/guide/README.md)

Выберете покружение `development [0]` в скрипте инициализации 
```sh
./init
``` 
что создаст настройки и скрипт `yii` для следующего шага. Настройки базы уже установлены для окружения, 
их согласно вашим нуждам можно изменить(`docker-codeception-run/docker-compose.yml`, `docker-run/docker-compose.yml`, `php-code/common/config/main.php` - требуется root).
> Внимание! Возникла ошибка доступа? При изменении настроек базы после её первого запуска не забываем останавливать композицию `docker-compose down` и чистить файлы базы `sudo rm -rf ../mysql-data/*`; Возникла ошибка `SQLSTATE[HY000] [2002] Connection refused` - база не успела поднятся. 

5.1.Выполнить миграции внутри контейнера

```sh
/usr/local/bin/docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-compose.yml exec php ./yii migrate/up
```

> Самое время создать дамп базы (например, такой метод использовался при создании используемого в тестах). При запущенном контейнере `dockerrun_db_1`
либо `dockercodeceptionrun_db_run_1` используем согласно [документации в описании образа](https://hub.docker.com/_/mysql/)
```sh
docker exec dockerrun_db_1 sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced' > php-code/common/tests/_data/dump.sql
```
При восстановлении необходимо добавить ключ `-i` для перенаправления ввода.
```sh
docker exec -i dockercodeceptionrun_db_1 sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced' < php-code/common/tests/_data/dump.sql
```

5.2.При выполнении последней мигации вы проведёте инициализацию rbac [см. общая инструкция установки шаблона](./guide/start-installation.md). **Первый пользователь получит права администратора**.

Создать пользователя можно тут же, командой
```sh
./yii user/create usermail@usermailserver.com login
```
> В случае ошибки на этапе создания первого пользователя права не будут выданы. Верните базу в первоначальный вид и попробуйте снова.

> email можно прочесть в папке php-code/console/runtime/mail

> Примечание: Для отправки почты (сообщение о регистрации, восстановление пароля, подтверждение ночты в модуле пользователей)
необходимо настроить отправку почты, согласно соответствующему пункту [инструкции](./guide/start-installation.md)

6.Выйти из контейнера (`exit`, ctrl+c) и запустить комплекс сервисов
```sh
$ docker-compose up -d
Creating network "dockerrun_default" with the default driver
Creating dockerrun_db_1
Creating dockerrun_php_1
Creating dockerrun_nginx_1
```

Сервис доступен по адресу `0.0.0.0:8080` - frontend, `0.0.0.0:8081` - backend

Для работы с xdebug используются переменные среды. Например,
`remote_host` может быть вашим IP адресом (вне docker network) или вашим DNS, если вы используете dns-server (например, локальный dns server или dns-server на вашем роутере. В последнем случае у вас может быть DNS совпадающее с именем машины). 
Docker может использовать данные этого dns сервера внутри запущенного контейнера и, соответственно, найти нуный IP.

> Для `mac OS` возможно использование специального служебного имени хоста `host.docker.internal`.



```
cat /etc/hosts
127.0.1.1	dev-Aspire-V3-772
```

```yml
XDEBUG_CONFIG: "remote_host=dev-Aspire-V3-772 remote_port=9001"
PHP_IDE_CONFIG: "serverName=docker-yii2-advanced-rbac"
```
В PHPStorm настроить следующее:
Добавить сервер с указанным в перемнной PHP_IDE_CONFIG именем
`Settings > Languages & Frameworks > PHP > Servers: [Name => docker-yii2-advanced-rbac]`
В нём изменить path mapping.
`Settings > Languages & Frameworks > PHP > Servers: [Use path mapping => True, /home/user/yourprojectname/php-code => /var/www/html]`
Изменить порт по умолчанию 9000 на используемый в настройках
`Settings > Languages & Frameworks > PHP > Debug: [Debug port => 9001]`
см. docker-run/docker-compose.yml#L13
`remote_port=9001`
