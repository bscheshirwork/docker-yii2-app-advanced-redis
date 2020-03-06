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
```sh
root@vpsidhere:~# dpkg-reconfigure tzdata
root@vpsidhere:~# date
root@vpsidhere:~# apt-get update
root@vpsidhere:~# apt-get install git mc
```
3.Создать пользователя `dev`, задать пароль, выдать права рута
неплохо расписано [тут](https://www.8host.com/blog/nachalnaya-nastrojka-servera-ubuntu-16-04/)
```sh
root@vpsidhere:~# adduser dev
Enter new UNIX password: 
```
```sh
root@vpsidhere:~# usermod -aG sudo dev
```
4.Добавить авторизацию по ключу. 
```sh
localuser@localmachine:~$ ssh-keygen -t rsa -b 4096 -C "localuser@localmachine to remoteuser@vpsidhere.vpsserver.com"
Enter file in which to save the key (/home/localuser/.ssh/id_rsa): /home/localuser/.ssh/id_localuser_to_dev_vpsidhere_fastvps
localuser@localmachine:~$ ssh-copy-id -i id_localuser_to_remotesuer_vpsidhere remoteuser@vpsidhere.vpsserver.com
```
Если `ssh` хочет ключ сразу и, соответственно, отказывает в подключении, 
```sh
ssh dev@{ip}
Received disconnect from {ip} port 22:2: Too many authentication failures
Connection to {ip} closed by remote host.
Connection to {ip} closed.
```
необходимо 
a) Настроить авторизацию только по логину+паролю
`~/.ssh/config`
```conf
Host vpsserver-remoteuser
     HostName remotehostorip
     User remoteuser
     PasswordAuthentication yes
     PubkeyAuthentication no
     Port 22
```
попробовать снова (обязательно подключение по алиасу, критично значение настроек `PasswordAuthentication yes` и `PubkeyAuthentication no`)
```sh
localuser@localmachine:~$ ssh-copy-id -i id_localuser_to_remotesuer_vpsidhere vpsserver-remoteuser
```

b) использовать вариант с копированием ключа вручную. 
Смотрим публичный ключ `cat ~/.ssh/id_localuser_to_remotesuer_vpsidhere.pub`
Для того чтобы добится ввода пароля убираем на клиенте
из домашней папки `.ssh` и после чего входим под пользователем, используя пароль (т.к. ключей не находит)
`ssh root@{ip}`

Создайте новый каталог .ssh и ограничьте доступ к нему:
```sh
mkdir ~/.ssh
chmod 700 ~/.ssh
```

Откройте файл `authorized_keys` в каталоге `.ssh`:
```sh
nano ~/.ssh/authorized_keys
```

Вставьте в него открытый ключ. Нажмите `CTRL-x`, `y` и `Enter`, чтобы закрыть и сохранить файл.

Заблокируйте доступ к файлу `authorized_keys`:
```sh
chmod 600 ~/.ssh/authorized_keys
```

5.Проверить подключившись по предложенной строке и `cat ~/.ssh/authorized_keys`

> Важно! Не отключайтесь от сервера, пока не убедитесь в том, что SSH-ключи работают.

На локальной машине откройте новый терминал и попробуйте подключиться к серверу.
```sh
localuser@localmachine:~$ ssh vpsserver-remoteuser
```

Если ключи настроены правильно, на данном этапе для подключения будет использован закрытый ключ. 
Если же настройка не удалась, система запросит пароль.

5.5.Отключение аутентификации на основе пароля (Применяется для всех пользователей)

Теперь для аутентификации сервер использует SSH-ключи. Отключите аутентификацию на основе пароля. Это ограничит доступ к 
серверу, так как SSH-ключи станут единственным способом подключиться к нему.

> Важно! Отключайте аутентификацию на основе пароля только в том случае, если добавили ключи и проверили их работу. 
В противном случае вы рискуете заблокировать себе доступ к собственному серверу!

В сессии пользователя `root` или `dev` откройте настройки демона SSH.
```sh
root@vpsidhere:~$ sudo nano /etc/ssh/sshd_config
```

Найдите строку `PasswordAuthentication`, раскомментируйте её и измените значение на `no`.
```conf
PasswordAuthentication no
```

В этом файле есть ещё две настройки по умолчанию, важные для аутентификации на основе ключей. Если вы не изменяли их ранее, не изменяйте их:
```conf
PubkeyAuthentication yes
ChallengeResponseAuthentication no
```

Сохраните и закройте файл (Ctrl-X, Y, Enter).

Перезапустите SSH:
```sh
root@vpsidhere:~$ sudo systemctl reload sshd
```

Теперь аутентификация на основе пароля отключена. Получить доступ к серверу можно только при помощи SSH-ключей.

## Настройка подключения к хранилищу кода
Создать пару ключей на сервере - для доступа к закрытым репозиториям (без защиты фразой, будет использоватся скриптами)
```sh
dev@vpsidhere:~# ssh-keygen -t rsa -b 4096 -C "dev@vpsidhere.vpsserver.com to bitbacket,gitlab"
Enter file in which to save the key (/home/dev/.ssh/id_rsa): /home/dev/.ssh/id_dev_to_git
```
Пользователю `bitbacket`/`gitlab`, который назначен ботом (или группе, если не хватает слотов - обычному) вписать публичный ключ
сгенерированной пары 
```sh
cat ~/.ssh/id_dev_to_git.pub
```
(`{avatar}->bitbucket settings->SSH keys`, `{avatar}->settings->SSH keys`)

> Также, для `bitbucket.org` есть возможность добавить ключ группе
[группе](https://bitbucket.org/account/user/yourgroup/ssh-keys/)

В дальнейшем пример для `bitbucket.org`.

Добавить конфиг для определения нужного публичного ключа
```sh
echo "Host bitbucket
     HostName bitbucket.org
     User botuseroryourgroup
     IdentityFile ~/.ssh/id_dev_to_git
" >> ~/.ssh/config
```

Проверка ssh доступа

Эта команда проверяет ваш SSH-агент на ключ SSH, а затем проверяет, 
соответствует ли этот закрытый ключ открытому ключу для существующей учетной записи Bitbucket:
```sh
$ ssh -T git@bitbucket.org
```
Варианты ответа:
```sh
$ ssh -T git@bitbucket.org
Permission denied (publickey). 
```
= Вы не имеете корректных ключей, загруженных в ssh-клиент (см. ниже)
```sh
$ ssh -T git@bitbucket.org
ssh: connect to host bitbucket.org port 22: Connection refused 
```
= невозможно получить IP адрес `bitbucket.org` для машины, с которой выполняется команда
```sh
$ ssh -T git@bitbucket.org
logged in as botuseroryourgroup.

You can use git or hg to connect to Bitbucket. Shell access is disabled.
```
= Всё в порядке!

Итак, если не запущен `ssh-client` 
```sh
remoteuser@vpsidhere:~$ ssh-add -l
Could not open a connection to your authentication agent
```
запускаем его, передавая переменные среды
```sh
remoteuser@vpsidhere:~$ eval `ssh-agent -s`
Agent pid 15518
```
Добавляем файл ключа, проверяем 
```sh
remoteuser@vpsidhere:~$ ssh-add ~/.ssh/id_dev_to_git
Identity added: /home/dev/.ssh/id_dev_to_git (/home/dev/.ssh/id_dev_to_git)

remoteuser@vpsidhere:~$ ssh-add -l
```
Проверка подключения по `ssh` к `bitbucket`
```sh
remoteuser@vpsidhere:~$ ssh -Tv git@bitbucket.org
```

Проверка закончилась успехом? Закрепим в автозагрузке. Добавляем в конец `.bashrc` (все три строчки, одинарные кавычки
для `echo '' >> ~/.bashrc`)
```sh
echo '
#!/bin/bash
eval `ssh-agent -s` 1>/dev/null
ssh-add ~/.ssh/id_dev_to_git
' >> ~/.bashrc
```

> note: Проверьте запустится ли ваш `.bashrc` При запуске оболочки. Посмотрите поведение `cat ~/.profile` 
```sh
# ~/.profile: executed by the command interpreter for login shells.
# This file is not read by bash(1), if ~/.bash_profile or ~/.bash_login exists.
# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
	. "$HOME/.bashrc"
    fi
fi
```
Проверьте переменную `echo $BASH_VERSION` - вывод не должен возвращать пустое значение  
Далее, соответствено, проверьте существование `~/.bash_profile` или `~/.bash_login` и, в случае существования добавьте в 
`~/.bash_profile` либо в `~/.bash_login`
аналогичные строки для запуска `.bashrc`
```sh
echo '
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
	. "$HOME/.bashrc"
    fi
fi
' >> ~/.bash_profile
```

Смысл в том, что `~/.bash_profile` читается при login, а `~/.bashrc` при интерактивном старте оболочки. 

# Для VPS позволяющих запустить докер 

6.Установить `Docker`, `docker-compose`, старый вариант [тут](https://www.8host.com/blog/ustanovka-i-ispolzovanie-docker-v-ubuntu-16-04/)
За исключением первого важного шага: Install packages to allow apt to use a repository over HTTPS:
```sh
$ sudo apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
```
Оффициальная инструкция установки `Docker` была изменена. Соответственно обновлён раздел [установка докера](./install-docker.md)
В случае, если что-либо не работает см. инструкцию на [офф. сайте](https://docs.docker.com/install/linux/docker-ce/ubuntu)

7.Установить `docker-compose`

8.Склонировать репозиторий с докер-композицией

Использовать подключение по `ssh` к хранилищу кода (см.выше "Настройка подключения к хранилищу кода").
```sh
git clone git@bitbucket.org:teamname/docker-yii2advanced.git /home/dev/projects/docker-yii2-app-advanced-rbac
```
При желании и для наглядности (по типу соринки в глазе) в корне создать ссылку на проект.
```sh
sudo ln -sF /home/dev/projects/docker-yii2-app-advanced-rbac /yii2advanced
```

Кроме клонирования репозитория с докер-композицией необходимо инициализировать `git submodule`
в папке `php-data` и переключить его на `master`. 
```sh
cd /home/dev/projects/docker-yii2-app-advanced-rbac
git submodule update --init --recursive --remote php-data
cd /home/dev/projects/docker-yii2-app-advanced-rbac/php-data
git checkout master 
```

9.Запустить конфигурацию `docker-compose.yml` из папки проекта `yii2advanced`.
Данная конфигурация включает только основные сервисы для работы и создана для `production`.
```sh
/usr/local/bin/docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-compose.yml up -d
```

10.Загрузить указанные в `composer.lock` версии пакетов (с опцией `--no-dev`)
```sh
time /usr/local/bin/docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-compose.yml run --rm php composer install --no-dev -vvv
```

11.Инициализировать как `production` ([см. install](./install.md))
```sh
/usr/local/bin/docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-compose.yml run --rm php ./init
Yii Application Initialization Tool v1.0

Which environment do you want the application to be initialized in?

  [0] Development
  [1] Production

  Your choice [0-1, or "q" to quit] 1

  Initialize the application under 'Production' environment? [yes|no] yes

  Start initialization ...

   generate yii
   generate frontend/config/params-local.php
   generate frontend/config/main-local.php
   generate frontend/web/index.php
   generate frontend/web/robots.txt
   generate common/config/params-local.php
   generate common/config/main-local.php
   generate console/config/params-local.php
   generate console/config/main-local.php
   generate backend/config/params-local.php
   generate backend/config/main-local.php
   generate backend/web/index.php
   generate backend/web/robots.txt
   generate cookie validation key in backend/config/main-local.php
   generate cookie validation key in frontend/config/main-local.php
      chmod 0777 backend/runtime
      chmod 0777 backend/web/assets
      chmod 0777 frontend/runtime
      chmod 0777 frontend/web/assets
      chmod 0755 yii

  ... initialization completed.
```
Внести данные локальных конфигов. Использовать `scp` либо редактор по вкусу (`mcedit`,`nano`,...)
```sh
usage: scp [-12346BCpqrv] [-c cipher] [-F ssh_config] [-i identity_file]
           [-l limit] [-o ssh_option] [-P port] [-S program]
           [[user@]host1:]file1 ... [[user@]host2:]file2
```

Таким образом также можно получить сгенерированные конфиги для дальнейшего исправления (выполнить на клиенте)
```sh
for i in backend common console frontend; do for j in main-local.php params-local.php; do mkdir -p /home/dev/projects/docker-yii2-app-advanced-rbac_config/php-data/$i/config; cp -p /home/dev/projects/docker-yii2-app-advanced-rbac/php-data/$i/config/$j /home/dev/projects/docker-yii2-app-advanced-rbac_config/php-data/$i/config/$j; done; done;
```
Необходимо указать настройки почты, настройки подключения к базе.

После исправления можно использовать для следующих установок/восстановления
После проверки настроек для `production`, можно применить их, скопировав на сервер
```sh
for i in backend common console frontend; do for j in "main-local.php" "params-local.php"; do scp /home/dev/projects/docker-yii2-app-advanced-rbac/php-data/$i/config/$j dev@host:/home/dev/projects/docker-yii2-app-advanced-rbac/php-data/$i/config/$j; done; done
```

Восстановление (настроек "как на сервере"), соответственно, обратное
```sh
for i in backend common console frontend; do for j in main-local.php params-local.php test-local.php; do sudo cp -p /home/dev/projects/docker-yii2-app-advanced-rbac_config/php-data/$i/config/$j /home/dev/projects/docker-yii2-app-advanced-rbac/php-data/$i/config/$j; done; done;
```

12.Выполнить миграции внутри контейнера / загрузить `dump`.

```sh
/usr/local/bin/docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-compose.yml exec php ./yii migrate/up
```
> Про загрузку дампа будет рассказано ниже.

13.После выполнения миграций, до выполнения следующего шага, необходимо убедится в работоспособности отправки почты -
к примеру из [формы обратной связи](http://0.0.0.0:8080/index.php?r=site%2Fcontact)

14.Необходимо создать пользователя-администратора с `id` = 1

```sh
/usr/local/bin/docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-compose.yml exec php bash
./yii user/create usermail@usermailserver.com login
```

## MySQL dump и архивирование
Общие сведения

Создаём бекап и сразу его архивируем
```sh
mysqldump -u USER -pPASSWORD DATABASE | gzip > /path/to/outputfile.sql.gz
```
Создание бекапа с указанием его даты
```sh
mysqldump -u USER -pPASSWORD DATABASE | gzip > `date +/path/to/outputfile.sql.%Y%m%d.%H%M%S.gz`
```
Заливаем бекап в базу данных
```sh
mysql -u USER -pPASSWORD DATABASE < /path/to/dump.sql
```
Заливаем архив бекапа в базу
```sh
gunzip < /path/to/outputfile.sql.gz | mysql -u USER -pPASSWORD DATABASE
```
или так
```sh
zcat /path/to/outputfile.sql.gz | mysql -u USER -pPASSWORD DATABASE
```

## Использование mysqldump через ssh и docker

Для создания дампа на сервере
```sh
docker exec yii2advanced_db_1 sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced 2>/dev/null' > ~/dump.sql
```
> ! Обязательное подавление предупреждения `[Warning] Using a password on the command line interface can be insecure.` для исключения оного из дампа.
> ! `docker-compose run` не работает после установки кодировки как параметров в точке входа. 

Используя `docker-compose`
```sh
/usr/local/bin/docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-compose.yml exec db sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced 2>/dev/null'>~/dump.sql
```

При восстановлении необходимо добавить ключ `-i` для перенаправления ввода.
```sh
docker exec -i yii2advanced_db_1 sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced' < ~/dump.sql
```

> ! `docker-compose` не позволяет работать с отключенным выводом и включённым вводом. Но включённый вывод даёт баг [https://github.com/docker/compose/issues/3352]
> ! `docker-compose run` не работает после установки кодировки как параметров в точке входа. 

Для создания дампа с передачей вывода на локальную машину. Запускать, соответственно, с клиента.
```sh
ssh vpsserver-remoteuser "docker exec yii2advanced_db_1 sh -c 'exec mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" yii2advanced 2>/dev/null'" > ~/dump.sql
```
Восстановить дамп с локальной машины.
```sh
ssh vpsserver-remoteuser "docker exec -i yii2advanced_db_1 sh -c 'exec mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" yii2advanced'" < ~/dump.sql
```

### docker MySQL update :arrow_up:
Пример для запущенного на разработке при обновлении версии движка базы.
Остановить композицию, Удалить файлы мускула, запустить новую версию, после чего развернуть дампы
1. 
> note: `--all-databases` поломан в `8.0.4`, не копировать схему. Схема создаётся заново. Копируются и восстанавливаются конкретные базы.
```sh
/usr/local/bin/docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-run/docker-compose.yml exec mysql sh -c 'exec mysqldump yii2advanced -uroot -p"$MYSQL_ROOT_PASSWORD" 2>/dev/null'>~/dump.sql
```
2. 
```sh
docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-run/docker-compose.yml down && sudo rm -rf /home/dev/projects/docker-yii2-app-advanced-rbac/mysql-data/* /home/dev/projects/docker-yii2-app-advanced-rbac/mysql-data-test/* && docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-run/docker-compose.yml up -d
```
3. 
```sh
time -p docker exec -i dockerrun_mysql_1 sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --database=yii2advanced' < ~/dump.sql
```
также, для надёжности можно сохранить файлы баз до окончания переезда:
1.5.
```sh
sudo mv /home/dev/projects/docker-yii2-app-advanced-rbac/mysql-data /home/dev/projects/docker-yii2-app-advanced-rbac/mysql-data-test /home/dev/projects/docker-yii2-app-advanced-rbac/mysql-bak/
``` 
```sh
sudo cp -rf /home/dev/projects/docker-yii2-app-advanced-rbac/mysql-bak/* /home/dev/projects/docker-yii2-app-advanced-rbac
```

### Применение 
Создание дампа и архивирование (полный путь к дампу, запуск с клиентской машины)
```sh
ssh vpsserver-remoteuser "docker exec yii2advanced_db_1 sh -c 'exec mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" yii2advanced 2>/dev/null' | gzip" > `date +/home/dev/dump.sql.%Y%m%d.%H%M%S.gz`
```
Восстановление из архива (полный путь к архиву)
```sh
zcat /home/dev/dump/1/dump.sql.date.time.gz | docker exec -i yii2advanced_db_1 sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced'
```

Восстановление из архива (полный путь к архиву, запуск с клиентской машины)
```sh
zcat /home/dev/dump/1/dump.sql.date.time.gz | ssh vpsserver-remoteuser "docker exec -i yii2advanced_db_1 sh -c 'exec mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" yii2advanced'"
```

Интерактивная консоль MySQL
```sh
docker exec -ti yii2advanced_db_1 sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced'
```
```sh
ssh vpsserver-remoteuser "docker exec yii2advanced_db_1 sh -c 'exec mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" yii2advanced'
```

## Скрипт с ротацией дампов

```sh
touch /home/dev/projects/docker-yii2-app-advanced-rbac_mysql_dump
chmod +x /home/dev/projects/docker-yii2-app-advanced-rbac_mysql_dump
```
Скрипт ротации для сервера.
При запуске 2 раза в день и перезаписи после 30 дней
```bash
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
time docker exec yii2advanced_db_1 sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" yii2advanced 2>/dev/null' | gzip > `date +$BACKUP_DIR/1/dump.sql.%Y%m%d.%H%M%S.gz`
ls -lAh $BACKUP_DIR/1
```

crontab -e 
```sh
* 8,19 * * * /home/dev/projects/docker-yii2-app-advanced-rbac_mysql_dump
```

## Копирование созданных дампов на локальную машину
 
```sh
touch /home/dev/projects/docker-yii2-app-advanced-rbac_mysql_dump_copy
chmod +x /home/dev/projects/docker-yii2-app-advanced-rbac_mysql_dump_copy
```
Копирование с клиентской машины по расписанию через 15 минут после начала дампа.
При запуске 2 раза в день и перезаписи после 30 дней
```bash
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
```sh
15 8,19 * * * /home/dev/projects/docker-yii2-app-advanced-rbac_mysql_dump_copy > /dev/null 2>&1
```


# Автообновление кода по git pull
```sh
touch /home/dev/projects/docker-yii2-app-advanced-rbac_git_pull
chmod +x /home/dev/projects/docker-yii2-app-advanced-rbac_git_pull
```
Скрипт
```bash
#!/bin/bash
eval `ssh-agent -s`
ssh-add ~/.ssh/id_dev_to_git
echo "yii2advanced:docker"
git --git-dir /home/dev/projects/docker-yii2-app-advanced-rbac/.git pull
echo "yii2advanced:php code"
git --git-dir /home/dev/projects/docker-yii2-app-advanced-rbac/php-data/.git pull
```

> Обратите внимание: данный скрипт не выполняет миграции `./yii migrate/up` и установку пакетов `composer install`
Скрипт можно расширить и для этих операций.
С учётом того, что данные операции имеют большое время выполнения необходимо создавать новую папку для проекта и 
после выполнения длительных операций перенаправить символическую ссылку, которую видят сервисы на неё.

crontab -e
```sh
1-59/5 * * * * /home/dev/projects/docker-yii2-app-advanced-rbac_git_pull
```

Также стоит посмотреть в сторону сине-зелёного деплоя и [проекта "рой"](https://github.com/dmstr/docker-roj) 


# Использование nginx-proxy
Из соображений безопастности на продакшене будте включён `firewall`
Можно отредактировать конфиг nginx с распределением по имени сервера и 80 портом - если данный сервис будет единственным
либо же использовать дополнительный прокси. Для этих целей создан одноимённый репозиторий и развёрнут на сервере.
Настройки следующие:

`docker-compose.yml`
```yml
version: '2'
services:
  nginx-proxy:
    image: nginx:1.13.11-alpine
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
```conf
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
```php
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'enableSchemaCache' => true,
        ],
    ],
```

В миграциях, изменяющих структуру таблиц
```php
    Yii::$app->db->schema->refresh();
```

После обновления структуры (если в миграциях не прописано очистки кеша) выполнить команду
```sh
/usr/local/bin/docker-compose -f /home/dev/projects/docker-yii2-app-advanced-rbac/docker-run/docker-compose.yml exec php ./yii cache/flush-schema --interactive=0
```

# Возможные проблемы [см. troubleshooting](./install-troubleshooting.md)
