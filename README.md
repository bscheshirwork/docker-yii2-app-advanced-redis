# Набор для работы с `redis`

Dockerized docker-yii2-advanced-redis

docker-yii2-advanced-redis, созданный в Docker-образоах окружения. В различных комбинациях (как для удобства разработки 
так и с возможностью развёртывания) используются отдельные сервисы для:   
- веб-сервера nginx
- образа php для yii2
- образа php для yii2 для запуска worker'ов очереди - с supervisor'ом
- образа php для yii2 с xdebug
- образа php для yii2 с xdebug и supervisor'ом
- образа хранилища redis
- базы mysql
- инструментов логгирования запросов на основе mysql-proxy
- тестов codeception на основе образа php для yii2
- браузера для выполнения приёмочных тестов selenium chrome (заменяем на firefox и проч.)

Сам код представлен отдельным репозиторием и не помещён в контейнер. Также вне контейнеров находятся настройки сервисов,
базы и логи. Такой подход обеспечивает удобство прямой работы с кодом и надёжность независимого от работы контейнеров хранения баз.  

Данный проект призван упростить развёртывание и подключение компонентов `redis`, для реализации очередей и кеша,
также наследует установку и настройку модулей управления пользователями и ролями.

Является наследником `yii2-advanced-rbac`, применимо всё, относящееся к нему.

## Документация

* [Установка](./docs/install.md)
* [codeception](/docs/codeception.md).
* [mysql-proxy](/docs/mysql-proxy.md).
* [Развёртывание без спец.инструментов](/docs/install-prod.md).

Описания
* [Структура наследования репозиториев](/docs/about-git-struture.md).
* [Про компонент очереди](/docs/about-queue.md).
* [Про компонент подключения redis](/docs/about-redis.md).
* [Про контейнер для worker'ов](/docs/about-supervisor.md).

Информация о yii2-advanced-rbac/redis
* [Установка и описание yii2-advanced-rbac](./docs/guide/README.md)
* [Документация исходного шаблона](https://github.com/yiisoft/yii2-app-advanced/blob/master/README.md)

All Rights Reserved.

2017 © bscheshir.work@gmail.com
