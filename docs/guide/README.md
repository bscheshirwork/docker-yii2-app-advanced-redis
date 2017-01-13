Набор модулей администрирования пользователей и ролей на шаблоне yii2-advanced
===========================

Данная документация призвана прояснить и упростить установку и настройку модулей управления пользователями и ролями

Вы можете выполнить установку готового шаблона на своё окружение с установленными и настроеными модулями с помощью команд
```
composer global require "fxp/composer-asset-plugin:~1.1.1"
composer create-project --prefer-dist bscheshirwork/yii2-advanced-rbac yii2-advanced-rbac
```
и инициализации, аналогичной исходному [шаблону advanced](https://github.com/yiisoft/yii2-app-advanced/blob/master/docs/guide/README.md)

В отличие от исходного шаблона, миграции необходимо выполнить для каждого из модулей
```
./yii migrate/up --migrationPath=@yii/rbac/migrations/
./yii migrate/up --migrationPath=@dektrium/user/migrations
./yii migrate/up --migrationPath=@mdm/admin/migrations
./yii migrate/up
```

Информация о создании данного примера приведена ниже

* [Установка](start-installation.md)

Информация о использовании модулей приведена ниже

* [Модули](start-modules.md)
