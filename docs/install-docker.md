# 1: Установка Docker

Пакет Docker можно найти в официальном репозитории Ubuntu 16.04. 
Однако чтобы получить наиболее актуальную версию программы, нужно обратиться к официальному реозиторию Docker. 
В этом разделе показано, как загрузить и установить пакет из официального репозитория Docker.

Обновите индекс пакетов:
```
sudo apt-get update
```

Добавьте возможность получать пакеты через https
```
sudo apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
```
Теперь можно загрузить и установить пакет Docker. Добавьте в систему GPG-ключ репозитория Docker:

```
sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
```
Добавьте этот репозиторий в APT (для Ubuntu 16.04 (Xenial Xerus)):
```
echo "deb https://apt.dockerproject.org/repo ubuntu-xenial main" | sudo tee /etc/apt/sources.list.d/docker.list
```

Обновите индекс пакетов системы:

```
sudo apt-get update
```
Следующая команда позволяет переключиться из репозитория Ubuntu 16.04 в репозиторий Docker:

```
apt-cache policy docker-engine
```
Команда должна вернуть:
```
docker-engine:
Installed: (none)
Candidate: 1.11.1-0~xenial
Version table:
1.11.1-0~xenial 500
500 https://apt.dockerproject.org/repo ubuntu-xenial/main amd64 Packages
1.11.0-0~xenial 500
500 https://apt.dockerproject.org/repo ubuntu-xenial/main amd64 Packages
```

Обратите внимание: пакет docker-engine пока не установлен. Версия пакета может отличаться.

Чтобы установить Docker, введите:

```
sudo apt-get install -y docker-engine
```
После этого программа Docker будет установлена; также это запустит демона и настроит автозапуск процесса. Чтобы убедиться в том, что программа работает, запросите её состояние:

```
sudo systemctl status docker
```

Команда должна вернуть:
```
docker.service - Docker Application Container Engine
Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)
Active: active (running) since Sun 2016-05-01 06:53:52 CDT; 1 weeks 3 days ago
Docs: https://docs.docker.com
Main PID: 749 (docker)
```

Теперь в системе работает сервис Docker (или демон). Также у вас есть доступ к утилите командной строки docker (это клиент Docker).

# 2: Настройка команды docker (опционально)

По умолчанию команда docker требует привилегий root (или доступа к команде sudo). Также её можно запускать в группе docker, которая создаётся автоматически во время установки программы Docker.

Если вы попытаетесь запустить команду docker без префикса sudo и вне группы docker, вы получите ошибку:

>docker: Cannot connect to the Docker daemon. Is the docker daemon running on this host?.
See 'docker run --help'.

Чтобы вам не пришлось набирать префикс sudo каждый раз когда вам нужно запустить команду docker, добавьте своего пользователя в группу docker:
```
sudo usermod -aG docker $(whoami)
```

Чтобы активировать это изменение, выйдите из системы и войдите снова.

Чтобы добавить в группу docker пользователя, который не является текущим, укажите в команде его имя:

```
sudo usermod -aG docker username
```

# 3: Установка docker-compose

Перейдите на страницу проекта на [GitHub](https://github.com/docker/compose/releases)

Следуйте инструкциям по установке в описании релиза. 
Например, для версии 1.1.12 (от `superuser`)

```
sudo -i
curl -L "https://github.com/docker/compose/releases/download/1.11.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
exit;
```

Проверить версию можно так
```
$ docker-compose --version

docker-compose version: 1.11.2
```

> Примечание: в конфигурации `cron`, `systemctl` и т.п. необходимо указываеть полные пути к исполнимому файлу, т.е. 
`/usr/local/bin/docker-compose`