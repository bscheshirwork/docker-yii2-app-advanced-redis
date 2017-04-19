## Codeception: заметки о тестировании в docker.

Первое - подготовить `Codeception` для тестирования этого проекта.
Взяв за основу `codeception/codeception`, создадим образ для запуска тестов с установленными дополнительными модулями.

[bscheshir/codeception:php-fpm-yii2](https://github.com/bscheshirwork/docker-codeception-yii2)

Для использования плюшек автодополнения и, главное, чтобы IDE не ругалась на неизвестные классы, от которых
наследуется актёр, можно извлечь из образа исходный код фреймворка тестирования и зависимостей.

Копируем, например, из запущеного контейнера, средствами `docker` 
```
docker cp dockercodeceptionrun_codecept_run_1:/repo/ .codecept
```

Для отладки тестов
В PHPStorm настроить следующее:
Добавить сервер с указанным в перемнной PHP_IDE_CONFIG именем
`Settings > Languages & Frameworks > PHP > Servers: [Name => codeceptiom]`
В нём изменить path mapping.
`Settings > Languages & Frameworks > PHP > Servers: [Use path mapping => True, /home/user/yourprojectname/.codecept => /repo, /home/user/yourprojectname/php-code => /project]`
Изменить порт по умолчанию 9000 на используемый в настройках
`Settings > Languages & Frameworks > PHP > Debug: [Debug port => 9002]`

Для запущенных случаев (например, возможных проверок фиксов самого фреймворка тестирования) справедливо обратное копирование
```
docker cp .codecept/src/Codeception/Lib/Connector/Yii2.php dockercodeceptionrun_codecept_run_1:/repo/src/Codeception/Lib/Connector/Yii2.php
docker cp .codecept/src/Codeception/Module/Yii2.php dockercodeceptionrun_codecept_run_1:/repo/src/Codeception/Module/Yii2.php
```


Для возможности запуска `selenium` из той же сети, созданной `docker` - в созданных командой `init` локальных точках входа тестов 
 `php-code/backend/web/index-test.php`, `php-code/frontend/web/index-test.php` нужно изменить проверку `IP`
```
//check if not in same subnet /16 (255.255.0.0)
if ((ip2long(@$_SERVER['REMOTE_ADDR']) ^ ip2long(@$_SERVER['SERVER_ADDR'])) >= 2 ** 16) {
    die('You are not allowed to access this file.');
}

```