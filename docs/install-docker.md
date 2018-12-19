# 1: Установка Docker

[Источник на офф. сайте](https://docs.docker.com/install/linux/docker-ce/ubuntu)

Пакет Docker можно найти в официальном репозитории Ubuntu 16.04. 
Однако чтобы получить наиболее актуальную версию программы, нужно обратиться к официальному реозиторию Docker. 
В этом разделе показано, как загрузить и установить пакет из официального репозитория Docker.

## Настройка репоитория

1.Обновите индекс пакетов:
```sh
sudo apt-get update
```

2.Добавьте возможность получать пакеты через `https`
```sh
sudo apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
```

3.Добавьте оффициальный `GPG` ключ `Docker'a`
```sh
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

4.Убедитесь, что теперь у вас есть ключ с отпечатком `9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88`, 
путем поиска последних 8 символов отпечатка.
```sh
$ sudo apt-key fingerprint 0EBFCD88

pub   4096R/0EBFCD88 2017-02-22
      Key fingerprint = 9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
uid                  Docker Release (CE deb) <docker@docker.com>
sub   4096R/F273FCD8 2017-02-22
```

5.Используйте следующую команду для установки репозитория `stable`. Репозиторий `stable` необходим, даже если вы хотите
устанавливать сборки из `edge` или `test` репозиториев. Для добавления `edge` или `test` репозиториев добавьте ключевые слова
`edge`, `test` (или оба) после ключевого слова `stable` в команде ниже.
> Пример для архитектуры `x86_64 / amd64`. Другие примеры см. в [оригинальной инструкции](https://docs.docker.com/install/linux/docker-ce/ubuntu/#set-up-the-repository)
```sh
$ sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
```
> Начиная с версии `Docker 17.06` стабильные релизы также пушатся в `edge` или `test` репозитории.
> [Узнайте больше о CE и EE изданиях, релизах, расписании выхода релизов](https://docs.docker.com/install)  

## Установка Docker CE

1.Обновите индекс пакетов:
```sh
sudo apt-get update
```

2.Установите последнюю версию `Docker CE` или перейдите к следующему пункту для установки строго определённой версии.
Все предыдущие установки `Docker` будут заменены.
```sh
$ sudo apt-get install docker-ce
```
> У вас установлено несколько репозиториев? В таком случае установка или обновление без указания определённой версии командами
`apt-get install` и `apt-get update` всегда приведёт к установке максимально возможно последней версии, то может быть
неприемлемо исходя из ваших требований к стабильности.

3.На сервере `production` в производственных системах вы должны установить определенную версию `Docker CE`, а не 
использовать последнюю версию. Далее перечислены доступные версии (сокращённо, вывод усечён до первой строки).
```sh
$ apt-cache madison docker-ce
 docker-ce | 18.03.0~ce-0~ubuntu | https://download.docker.com/linux/ubuntu xenial/stable amd64 Packages
```
Содержимое списка зависит от того, какие репозитории включены. Выберите конкретную версию для установки. 
Второй столбец - строковое представление версии. Третий столбец - это имя репозитория, в котором указывается, 
из какого репозитория будет взят пакет, а по умолчанию - его уровень стабильности.
Чтобы установить определенную версию, добавьте строковое представление версии к имени пакета, 
разделив их знаком равенства (=):

```sh
$ sudo apt-get install docker-ce=<VERSION>
```

`Docker CE` установлен и запущен. 

Группа `docker` создана, но в неё не добавлено ни одного пользователя. Вам необходимо использовать `sudo` для запуска 
`Docker` команд (см. следующий раздел).


Теперь в системе работает сервис Docker (или демон). 
Чтобы убедиться в том, что `Docker` работает, запросите состояние:
```sh
sudo systemctl status docker
```
Команда должна вернуть (вывод усечён):
```sh
● docker.service - Docker Application Container Engine
   Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)
   Active: active (running) since Пн 2018-01-29 10:00:00 MSK; 1min 31s ago
     Docs: https://docs.docker.com
 Main PID: 749 (dockerd)
...
```

Также у вас есть доступ к утилите командной строки docker (это клиент Docker).

Для проверки корректности установки `Docker CE` запустите образ `hello-world`
```sh
$ sudo docker run hello-world
```

# 2: Настройка команды docker (опционально)

По умолчанию команда `docker` требует привилегий `root` (`sudo`...). Также её можно запускать в группе 
`docker`, которая создаётся автоматически во время установки программы Docker.

Если вы попытаетесь запустить команду `docker` без префикса `sudo` и вне группы `docker`, вы получите ошибку:

>docker: Cannot connect to the Docker daemon. Is the docker daemon running on this host?.
See 'docker run --help'.

### Добавьте своего пользователя в группу `docker`

Чтобы вам не пришлось набирать префикс `sudo` каждый раз когда вам нужно запустить команду `docker`, 
добавьте своего пользователя в группу `docker`:
```sh
sudo usermod -aG docker $(whoami)
```

Чтобы активировать это изменение, выйдите из системы и войдите снова.

Чтобы добавить в группу docker пользователя, который не является текущим, укажите в команде его имя:

```sh
sudo usermod -aG docker username
```

>Если вы до этого использовали `sudo docker`, может появится ошибка
```sh
WARNING: Error loading config file: /home/user/.docker/config.json -
stat /home/user/.docker/config.json: permission denied
```
> Удалите дирректорию `~/.docker/` (она будет создана заново, но все настройки будут потеряны) либо измените владельца и
права доступа
```sh
$ sudo chown "$USER":"$USER" /home/"$USER"/.docker -R
$ sudo chmod g+rwx "/home/$USER/.docker" -R
```

### Настройка Docker для автозапуска

Большинство текущих дистрибутивов Linux (RHEL, CentOS, Fedora, Ubuntu 16.04 и выше) используют `systemd` 
для управления автозапуском сервисов. Команда добавления сервиса в список автозапуска выглядит так:
```sh
$ sudo systemctl enable docker
```
Для отключения этого поведения используйте команду `disable`.
```sh
$ sudo systemctl disable docker
```


# 3: Установка docker-compose

Перейдите на страницу проекта на [GitHub](https://github.com/docker/compose/releases)

Следуйте инструкциям по установке в описании релиза. 
Например, для версии 1.21.0

Перейти в консоль `root@host#`
```sh
sudo -i
```
в ней выполнить команды
```sh
curl -L https://github.com/docker/compose/releases/download/1.21.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```
и выйти
```sh
exit
```

Проверить версию можно так
```sh
$ docker-compose --version

docker-compose version: 1.21.0
```

> Примечание: в конфигурации `cron`, `systemctl` и т.п. необходимо указываеть полные пути к исполнимому файлу, т.е. 
`/usr/local/bin/docker-compose`

# Обновление

Для обновления `Docker CE`, сначала обновите список пакетов `sudo apt-get update`, 
затем следуйте инструкциям к версии той новой версии, которую вы хотите установить.
> `sudo apt upgrade -y` достаточно для обновления `Docker CE` до последней доступной версии.

# Удаление

Удаление пакета `Docker CE`:
```sh
$ sudo apt-get purge docker-ce
```

Образы (Images), контейнеры (containers), хранилища (volumes) или специфические настроечные фалы на вашем сервере 
НЕ удаляются автоматически. Для удаления всех образов, контейнеров и хранилищ используйте
```sh
$ sudo rm -rf /var/lib/docker
```

Все изменённые файлы настрек необходимо удалить вручную.

# Скрипт для просмотра зависимотей

В случаях, когда невозможно просто взять и удалить образ, поможет просмотр потомков. Расположите скрипт в папке `/usr/lockal/bin`
и добавьте права на выполнения.
```sh
sudo gedit /usr/local/bin/docker-tree
```
```sh
#!/bin/bash
parent_short_id=$1
parent_id=`docker inspect --format '{{.Id}}' $1`

get_kids() {
   local parent_id=$1
   docker inspect --format='ID {{.Id}} PAR {{.Parent}}' $(docker images -a -q) | grep "PAR ${parent_id}" | sed -E "s/ID ([^ ]*) PAR ([^ ]*)/\1/g"
}

print_kids() {
   local parent_id=$1
   local prefix=$2
   local tags=`docker inspect --format='{{.RepoTags}}' ${parent_id}`
   echo "${prefix}${parent_id} ${tags}"

   local children=`get_kids "${parent_id}"`

   for c in $children;
   do
       print_kids "$c" "$prefix  "
   done
}

print_kids "$parent_id" ""
```

```sh
sudo chmod ugo+x /usr/local/bin/docker-tree
```

[@see](https://gist.github.com/mlinhard/d460b2a6b3f6cd4426e554da040c0658) 