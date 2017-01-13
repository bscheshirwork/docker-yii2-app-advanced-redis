
##Заметки по тестированию.

Первое - подготовить `Codeception` для тестирования этого проекта.
Взяв за основу `codeception/codeception`, создадим образ для запуска тестов с установленными дополнительными модулями.
(доступен из докерхаба, описание создания)
```
cd docker-codeception-run
git submodule add https://github.com/Codeception/Codeception.git docker-codeception-run/build
cd docker-codeception-run/build
git checkout 2.2 
cp ../Dockerfile ../composer.json ./ 
docker build -t bscheshir/codeception:7.0.13-fpm-4yii2 .
```

Замена базы
```
sed -i -e "s/^FROM.*/FROM bscheshir\/php:7.0.13-fpm-4yii2/" Dockerfile
```
Также данная сборка будет разрешать зависимости
`composer.json`
```
    "require": {
...
        "codeception/specify": "*",
        "codeception/verify": "*"
    }
```

Использовать бинд на папку `tests`.
```
  codecept:
    image: bscheshir/codeception:7.0.13-fpm-4yii2
    depends_on:
      - php
    environment:
      XDEBUG_CONFIG: "remote_host=192.168.88.241 remote_port=9008 remote_enable=On"
      PHP_IDE_CONFIG: "serverName=codeception"
    volumes:
      - ../php-code/tests:/project
```

Запускать сервис `codecept`, следовать [инструкциям](/php-code/tests/README.md)
```
~/projects/petshelter/docker-codeception-run$ docker-compose run --rm --entrypoint bash codecept
root@e870b32bc227:/project# cd tests/
```

Для использования плюшек автодополнения и, главное, чтобы IDE не ругалась на неизвестные классы, от которых
наследуется актёр, можно извлечь из образа исходный код фреймворка тестирования и зависимостей.

Копируем, например, в `test/.repo` 
```
root@e870b32bc227:/project# cp -r /repo/ /project/tests/.repo
```
