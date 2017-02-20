# Развёртывание на сервере.

В данном руководстве описывается развёртывание системы на VPS


Внимание! Изначально был выбран хостер с устаревшим ядром: следующая система

`Ubuntu 16.04.1 LTS (GNU/Linux 2.6.32-042stab120.16 x86_64)`

не поддерживает докер.

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
localuser@localmachine:~$ ssh-keygen -t rsa -b 4096 -C "localuser@localmachine to dev@vpsidhere.vpsserver.com"
Enter file in which to save the key (/home/localuser/.ssh/id_rsa): /home/localuser/.ssh/id_localuser_to_dev_vpsidhere_fastvps
localuser@localmachine:~$ ssh-copy-id -i id_localuser_to_dev_vpsidhere_fastvps dev@vpsidhere.vpsserver.com
```
5.Проверить подключившись по предложенной строке и `cat ~/.ssh/authorized_keys`


## Настройка подключения к хранилищу кода
Создать пару ключей на сервере - для доступа к закрытым репозиториям (без защиты фразой, будет использоватся скриптами)
```
root@vpsidhere:~# ssh-keygen -t rsa -b 4096 -C "dev@vpsidhere.vpsserver.com to bitbacket,gitlab"
Enter file in which to save the key (/home/dev/.ssh/id_rsa): /home/dev/.ssh/id_dev_to_git
```
Пользователю `bitbacket`/`gitlab`, который назначен ботом (или. если не хватает слотов - обычному) вписать публичный ключ
сгенерированной пары (`{avatar}->bitbucket settings->SSH keys`, `{avatar}->settings->SSH keys`)


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

8.Склонировать репозиторий с докер-композицией, запустить.

9.Инициализировать как `production` ([см. install](./install.md))

10.Выполнить миграции

# Для VPS, всё ещё работающих на старом-добром-проверенном-устаревающем ядре 2.6 образца 2003-2011гг.

6.Установить и настроить `nginx`
7.Установить и настроить `php`
8.Установить и настроить `mysql`
9.Склонировать репозиторий, изменить настройки для полученой связки сервисов.
10.Инициализировать как `production` ([см. install](./install.md))
11.Выполнить миграции