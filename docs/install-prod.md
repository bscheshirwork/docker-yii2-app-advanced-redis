# Развёртывание на сервере.

В данном руководстве описывается развёртывание системы на VPS


Внимание! Изначально был выбран хостер с устаревшим ядром: следующая система

`Ubuntu 16.04.1 LTS (GNU/Linux 2.6.32-042stab120.16 x86_64)`

не поддерживает докер.

Выбирайте хостеров с умом!

`Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-31-generic x86_64)`


# Настройка сервера. 
1.Успешно подключится под рутом к серверу используя пароль.
`localuser@localmachine:~$ ssh root@vpsidhere.vpsserver.com`
2.Задать временную зону, установить `git` по желанию `mc`
```
root@vpsidhere:~# dpkg-reconfigure tzdata
root@vpsidhere:~# date
root@vpsidhere:~# apt-get update
root@vpsidhere:~# apt-get install git mc
```
3.Создать пользователя `dev`, задать пароль, выдать права рута
неплохо расписано [тут](https://www.8host.com/blog/nachalnaya-nastrojka-servera-ubuntu-16-04/)
```
root@vpsidhere:~# adduser dev
Enter new UNIX password: 
```
```
root@vpsidhere:~# usermod -aG sudo dev
```
4.Добавить авторизацию по ключу. 
```
localuser@localmachine:~$ ssh-keygen -t rsa -b 4096 -C "localuser@localmachine to remoteuser@vpsidhere.vpsserver.com"
Enter file in which to save the key (/home/localuser/.ssh/id_rsa): /home/localuser/.ssh/id_localuser_to_dev_vpsidhere_fastvps
localuser@localmachine:~$ ssh-copy-id -i id_localuser_to_remotesuer_vpsidhere remoteuser@vpsidhere.vpsserver.com
```
Если `ssh` хочет ключ сразу и, соответственно, отказывает в подключении, 
```
ssh dev@{ip}
Received disconnect from {ip} port 22:2: Too many authentication failures
Connection to {ip} closed by remote host.
Connection to {ip} closed.
```
необходимо 
a) Настроить авторизацию только по логину+паролю
`~/.ssh/config`
```
Host vpsserver-remoteuser
     HostName remotehostorip
     User remoteuser
     PasswordAuthentication yes
     PubkeyAuthentication no
     Port 22
```
попробовать снова (подключение по алиасу)
```
localuser@localmachine:~$ ssh-copy-id -i id_localuser_to_remotesuer_vpsidhere vpsserver-remoteuser
```

b) использовать вариант с копированием ключа вручную. 
Смотрим публичный ключ `cat ~/.ssh/id_localuser_to_remotesuer_vpsidhere.pub`
Для того чтобы добится ввода пароля убираем на клиенте
из домашней папки `.ssh` и после чего входим под пользователем, используя пароль (т.к. ключей не находит)
`ssh root@{ip}`

Создайте новый каталог .ssh и ограничьте доступ к нему:
```
mkdir ~/.ssh
chmod 700 ~/.ssh
```

Откройте файл `authorized_keys` в каталоге `.ssh`:
```
nano ~/.ssh/authorized_keys
```

Вставьте в него открытый ключ. Нажмите `CTRL-x`, `y` и `Enter`, чтобы закрыть и сохранить файл.

Заблокируйте доступ к файлу `authorized_keys`:
```
chmod 600 ~/.ssh/authorized_keys
```


5.Проверить подключившись по предложенной строке и `cat ~/.ssh/authorized_keys`


## Настройка подключения к хранилищу кода
Создать пару ключей на сервере - для доступа к закрытым репозиториям (без защиты фразой, будет использоватся скриптами)
```
dev@vpsidhere:~# ssh-keygen -t rsa -b 4096 -C "dev@vpsidhere.vpsserver.com to bitbacket,gitlab"
Enter file in which to save the key (/home/dev/.ssh/id_rsa): /home/dev/.ssh/id_dev_to_git
```
Пользователю `bitbacket`/`gitlab`, который назначен ботом (или. если не хватает слотов - обычному) вписать публичный ключ
сгенерированной пары (`{avatar}->bitbucket settings->SSH keys`, `{avatar}->settings->SSH keys`)

В дальнейшем пример для `bitbucket.org`.

Добавить конфиг для определения нужного публичного ключа
```
echo "Host bitbucket
     HostName bitbucket.org
     User botusernameonbitbucket
     IdentityFile ~/.ssh/id_dev_to_git
" >> /home/dev/.ssh/config
```

Если не запущен `ssh-client` 
```
remoteuser@vpsidhere:~$ ssh-add -l
Could not open a connection to your authentication agent
```
запускаем его, передавая переменные среды
```
remoteuser@vpsidhere:~$ eval `ssh-agent -s`
Agent pid 15518
```
Добавляем файл ключа, проверяем 
```
remoteuser@vpsidhere:~$ ssh-add ~/.ssh/id_dev_to_git
Identity added: /home/dev/.ssh/id_dev_to_git (/home/dev/.ssh/id_dev_to_git)

remoteuser@vpsidhere:~$ ssh-add -l
```
Проверка подключения по `ssh` к `bitbucket`
```
remoteuser@vpsidhere:~$ ssh -Tv git@bitbucket.org
```

Проверка закончилась успехом? Закрепим в автозагрузке. Добавляем в конец `.bashrc` (все три строчки)
```
#!/bin/bash
eval `ssh-agent -s`
ssh-add ~/.ssh/id_dev_to_git
```


# Для VPS позволяющих запустить докер 

6.Установить `Docker`, `docker-compose`, опять-таки подробно описано [тут](https://www.8host.com/blog/ustanovka-i-ispolzovanie-docker-v-ubuntu-16-04/)
За исключением первого важного шага: Install packages to allow apt to use a repository over HTTPS:
```
$ sudo apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
```
Нужная часть руководства - [установка докера](./install-docker.md)
Ели что-либо не работает, см. инструкцию на офф. сайте https://docs.docker.com/engine/installation/linux/ubuntu/

7.Установить `docker-compose`

8.Склонировать репозиторий с докер-композицией

Использовать подключение по `ssh` к хранилищу кода (см.выше "Настройка подключения к хранилищу кода").
```
git clone git@bitbucket.org:teamname/docker-yii2advanced.git /home/dev/projects/yii2advanced
```
При желании и для наглядности (по типу соринки в глазе) в корне создать ссылку на проект.
```
sudo ln -sF /home/dev/projects/yii2advanced /yii2advanced
```

Кроме клонирования репозитория с докер-композицией необходимо инициализировать `git submodule`
в папке `php-code`. 
```
cd /home/dev/projects/yii2advanced
git submodule update --init --recursive --remote php-code
```

9.Запустить конфигурацию `docker-compose.yml` из папки проекта `yii2advanced`.
Данная конфигурация включает только основные сервисы для работы и создана для `production`.
```
/usr/local/bin/docker-compose -f /home/dev/projects/yii2advanced/docker-compose.yml up -d
```

10.Загрузить указанные в `composer.lock` версии пакетов
```
time /usr/local/bin/docker-compose -f /home/dev/projects/yii2advanced/docker-compose.yml run --rm php composer install -vv
```

11.Инициализировать как `production` ([см. install](./install.md))
Внести данные локальных конфигов. Использовать `scp` либо редактор по вкусу (`mcedit`,`nano`,...)
```
usage: scp [-12346BCpqrv] [-c cipher] [-F ssh_config] [-i identity_file]
           [-l limit] [-o ssh_option] [-P port] [-S program]
           [[user@]host1:]file1 ... [[user@]host2:]file2
```

Таким образом, перенесём конфиги для дальнейшего исправления (выполнить на клиенте)
```
for i in backend common console frontend; do for j in "main-local.php" "params-local.php"; do scp /home/dev/projects/yii2advanced/php-code/$i/config/$j dev@host:/home/dev/projects/yii2advanced/php-code/$i/config/$j; done; done
```
Необходимо указать настройки почты, настройки подключения к базе. 

12.Выполнить миграции внутри контейнера / загрузить `dump`.

```
/usr/local/bin/docker-compose -f /home/dev/projects/yii2advanced/docker-compose.yml run --rm php /bin/sh

for i in "--migrationPath=@yii/rbac/migrations/" "--migrationPath=@dektrium/user/migrations" "--migrationPath=@mdm/admin/migrations" ""; do ./yii migrate/up $i; done
```
После выполнения миграций, убедившись зарание в работоспособности отправки почты (к примеру из формы обратной связи),
не забываем создать пользователя-администратора с id = 1

```
./yii user/create usermail@usermailserver.com login
```

# Использование mysqldump через ssh и docker

Для создания дампа на сервере
```
docker exec yii2advanced_db_1 sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced' > ~/dump.sql
```

При восстановлении необходимо добавить ключ `-i` для перенаправления ввода.
```
docker exec -i yii2advanced_db_1 sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced' < ~/dump.sql
```

Для создания дампа с передачей вывода на локальную машину. Запускать, соответственно, с клиента.
```
ssh vpsserver-remoteuser "docker exec yii2advanced_db_1 sh -c 'exec mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" yii2advanced'" > ~/dump.sql
```
Восстановить дамп с локальной машины.
```
ssh vpsserver-remoteuser "docker exec -i yii2advanced_db_1 sh -c 'exec mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" yii2advanced'" < ~/dump.sql
```

## MySQL dump и архивирование
Общие сведения

Создаём бекап и сразу его архивируем
```
mysqldump -u USER -pPASSWORD DATABASE | gzip > /path/to/outputfile.sql.gz
```
Создание бекапа с указанием его даты
```
mysqldump -u USER -pPASSWORD DATABASE | gzip > `date +/path/to/outputfile.sql.%Y%m%d.%H%M%S.gz`
```
Заливаем бекап в базу данных
```
mysql -u USER -pPASSWORD DATABASE < /path/to/dump.sql
```
Заливаем архив бекапа в базу
```
gunzip < /path/to/outputfile.sql.gz | mysql -u USER -pPASSWORD DATABASE
```
или так
```
zcat /path/to/outputfile.sql.gz | mysql -u USER -pPASSWORD DATABASE
```

Применение (полный путь к дампу, запуск с клиентской машины)
```
ssh vpsserver-remoteuser "docker exec yii2advanced_db_1 sh -c 'exec mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" yii2advanced' | gzip" > `date +/home/dev/dump.sql.%Y%m%d.%H%M%S.gz`
```

## Скрипт с ротацией дампов

```
touch /home/dev/projects/yii2advanced_mysql_dump
chmod +x /home/dev/projects/yii2advanced_mysql_dump
```
Скрипт ротации для сервера.
При запуске 2 раза в день и перезаписи после 30 дней
```
#!/bin/bash
export BACKUP_DIR='/home/dev/dump'
((SUBFOLDERNUM = 30*2))
echo "start dump rotation job"
rm -rf $BACKUP_DIR/$SUBFOLDERNUM
for (( count=$SUBFOLDERNUM, prev=$SUBFOLDERNUM-1; count>1; count--, prev = $count-2))
do
  if [ -d "$BACKUP_DIR/$prev" ]; then
    mv $BACKUP_DIR/$prev $BACKUP_DIR/$count
    ls -lAh $BACKUP_DIR/$count
  fi
done
echo "start dump job"
mkdir -p $BACKUP_DIR/1
time docker exec yii2advanced_db_1 sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced' | gzip > `date +$BACKUP_DIR/1/dump.sql.%Y%m%d.%H%M%S.gz`
ls -lAh $BACKUP_DIR/1
```

crontab -e 
```
* 8,19 * * * /home/dev/projects/yii2advanced_mysql_dump
```

## Копирование созданных дампов на локальную машину
 
```
touch /home/dev/projects/yii2advanced_mysql_dump_copy
chmod +x /home/dev/projects/yii2advanced_mysql_dump_copy
```
Копирование с клиентской машины по расписанию через 15 минут после начала дампа.
При запуске 2 раза в день и перезаписи после 30 дней
```
#!/bin/bash
export BACKUP_DIR_REMOTE='/home/dev/dump'
export BACKUP_DIR='/home/dev/dump_8host'
((SUBFOLDERNUM = 30*2))
echo "start dump rotation job"
rm -rf $BACKUP_DIR/$SUBFOLDERNUM
for (( count=$SUBFOLDERNUM, prev=$SUBFOLDERNUM-1; count>1; count--, prev = $count-2))
do
  if [ -d "$BACKUP_DIR/$prev" ]; then
    mv $BACKUP_DIR/$prev $BACKUP_DIR/$count
    ls -lAh $BACKUP_DIR/$count
  fi
done
echo "start copy dump job"
mkdir -p $BACKUP_DIR
time scp -r vpsserver-remoteuser:"$BACKUP_DIR_REMOTE"/1 "$BACKUP_DIR"
ls -lAh $BACKUP_DIR
```

crontab -e 
```
15 8,19 * * * /home/dev/projects/yii2advanced_mysql_dump_copy > /dev/null 2>&1
```


# Автообновление кода по git pull
```
touch /home/dev/projects/yii2advanced_git_pull
chmod +x /home/dev/projects/yii2advanced_git_pull
```
Скрипт
```
#!/bin/bash
eval `ssh-agent -s`
ssh-add ~/.ssh/id_dev_to_git
echo "yii2advanced:docker"
git --git-dir /home/dev/projects/yii2advanced/.git pull
echo "yii2advanced:php code"
git --git-dir /home/dev/projects/yii2advanced/php-code/.git pull
```

> Обратите внимание: данный скрипт не выполняет миграции `./yii migrate/up` и установку пакетов `composer install`
Скрипт можно расширить и для этих операций.
С учётом того, что данные операции имеют большое время выполнения необходимо создавать новую папку для проекта и 
после выполнения длительных операций перенаправить символическую ссылку, которую видят сервисы на неё.

crontab -e
```
1-59/5 * * * * /home/dev/projects/yii2advanced_git_pull
```

Также стоит посмотреть в сторону сине-зелёного деплоя и [проекта "рой"](https://github.com/dmstr/docker-roj) 


# Использование nginx-proxy
Из соображений безопастности на продакшене будте включён `firewall`
Можно отредактировать конфиг nginx с распределением по имени сервера и 80 портом - если данный сервис будет единственным
либо же использовать дополнительный прокси. Для этих целей создан одноимённый репозиторий и развёрнут на сервере.
Настройки следующие:

`docker-compose.yml`
```
version: '2'
services:
  nginx-proxy:
    image: nginx:1.11.12-alpine
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx-conf:/etc/nginx/conf.d #nginx-conf
      - ./nginx-logs:/var/log/nginx #nginx-logs
networks:
  default:
    external:
      name: yii2advanced_default
```
`nginx.conf`
```
server {
    listen  80;
    #listen [::]:80 default_server ipv6only=on; ## слушаем ipv6
    server_name frontend.yii2advanced.ru www.frontend.yii2advanced.ru;

    access_log  /var/log/nginx/proxy-access.log;
    error_log   /var/log/nginx/proxy-error.log;

    location / {
        proxy_pass http://nginx:80/;
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
    #listen [::]:80 default_server ipv6only=on; ## слушаем ipv6
    server_name backend.yii2advancedadmin.ru www.backend.yii2advancedadmin.ru;

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
    #listen [::]:80 default_server ipv6only=on; ## слушаем ipv6
    server_name anotherservicedomain.ru;

    access_log  /var/log/nginx/proxy-access.log;
    error_log   /var/log/nginx/proxy-error.log;

    location / {
        proxy_pass http://nginx:80808/;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   Host $http_host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ /\.(ht|svn|git) {
        deny all;
    }
}
```

# Использование кеша для структуры таблиц

В настройках приложения `common`
```
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'enableSchemaCache' => true,
        ],
    ],
```

В миграциях, изменяющих структуру таблиц
```
    Yii::$app->db->schema->refresh();
```

После обновления структуры (если в миграциях не прописано очистки кеша) выполнить команду
```
/usr/local/bin/docker-compose -f /home/dev/projects/yii2advanced/docker-run/docker-compose.yml run --rm php ./yii cache/flush-all
```

# Возможные проблемы [см. troubleshooting](./install-troubleshooting.md.md)
