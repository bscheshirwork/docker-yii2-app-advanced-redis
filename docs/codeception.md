# Codeception и тестирование шаблонов yii2

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

### Тонкая настройка окружения и точечные изменения
Для возможности запуска `selenium` из той же сети, созданной `docker` - в созданных командой `init` локальных точках входа тестов 
 `php-code/backend/web/index-test.php`, `php-code/frontend/web/index-test.php` нужно изменить проверку `IP`
```
//check if not in same subnet /16 (255.255.0.0)
if ((ip2long(@$_SERVER['REMOTE_ADDR']) ^ ip2long(@$_SERVER['SERVER_ADDR'])) >= 2 ** 16) {
    die('You are not allowed to access this file.');
}
```

Также изменен принцип подключения к тестовой базе - используется одинаковое имя базы, но при подключении сервис `db`
будет переключён на другую дирректорию `mysql-data-test` - следовательно в настройках переопределение подключения избыточно.
`common/config/test-local.php`
```
    [
        'components' => [
            'db' => [
                // Uncomment this line if your run Codeception test without Docker
                // 'dsn' => 'mysql:host=localhost;dbname=yii2advanced_test',
            ]
        ],
    ]
```

Для тестирования отправки почты необходимы права на запись в `/var/www/html/[backend|frontend]/runtime/mail/` из контейнера.
Т.е `chmod o+rwx ./php-code/backend/runtime/mail`, `chmod o+rwx ./php-code/frontend/runtime/mail`

Важен порядок подключения модулей `Codeception`: `DbYii2Config` c `populate/cleanup` ранее `Yii2`
```yml
        - \bscheshirwork\Codeception\Module\DbYii2Config:
            dump: ../common/tests/_data/dump.sql #relative path from "codeception.yml"
            populate: true
            cleanup: true
        - Yii2
```

Для детального анализа можно почистить директории вывода перед запуском
```
for i in frontend backend; do sudo rm php-code/$i/tests/_output/$i.tests.* php-code/$i/tests/_output/debug/* php-code/$i/tests/_output/failed; done
```

## Запуск оболочки в контейнере Codeception
```
docker-compose -f docker-codeception-run/docker-compose.yml run --rm --entrypoint bash codecept
```

## Покрытие кода тестами и c3.php

### Настройки для `acceptance` тестов

> Замечание для `acceptance` тестов: необходим `c3.php`, который требует установки `Codeception` в зависимостях.
что вызввает необходимость дублировать код фреймворка тестирования.  
Остальные типы тестов позволяют использовать проверку покрытия не устанавливая зависимость в `composer.json` кода,
оставляя всю работу с тестами в контейнере сервиса тестов `codecept`

Точка входа для тестов `php-code/backend|frontend/web/index-test.php` должна быть дополнена `c3.php` для определения покрытия при работе с 
различными контейнерами для кода и для веб-сервера
```php
// Codeception testing routes
if (file_exists(__DIR__ . '/../../c3.php')) {
    define('C3_CODECOVERAGE_ERROR_LOG_FILE',
        __DIR__ . '/runtime/c3_error.log'); //Optional (if not set the default c3 output dir will be used)
    define('C3_CODECEPTION_CONFIG_PATH',
        __DIR__ . '/tests'); //Optional (if not set the default c3 output dir will be used)
    require_once __DIR__ . '/../../c3.php';
}
```

При этом `c3.php` расположен в `php-code/` и общий для `frontend` и `backend` групп тестов.
```sh
cd php_code
wget https://raw.github.com/Codeception/c3/2.0/c3.php

wget http://codeception.com/codecept.phar
```
`codecept.phar` использован, дабы не плодить мусор в вендорах (чего хотелось, до последнего, избежать)
это позоволяет не трогать `composer.json` в секции `require-dev`. Минус - ручное обновление. 

> Можно заметить, что при сборе данных о покрытии с помощью `c3.php` используется Codeception из `codecept.phar` и 
выполняется код внутри контейнера сервиса `php`. Который отличался от контейнера сервиса `codecept`
"точкой монтирования" `php-code`.
Это не позволяло Codeception смешать результаты покрытия: например, из `/var/www/html/frontend/models/ContactForm.php` 
и `/project/frontend/models/ContactForm.php` брался только существующий в `codecept` путь `/project/...`
Установка `workdir` сервиса `codecept` в `/var/www/html/` решило проблему.

Настройки "удалённого тестирования" включают в себя `c3_url` (опционально) и `remote_config` (обязательно)

Необходим полный доступ к папкам отчётов. Задайте его, если возникают соответствующие проблемы.
```sh
sudo chmod -R go+rw php-code/frontend/tests/_output php-code/backend/tests/_output php-code/common/tests/_output
```

Настройки групп тестов отличаются портом
`php-code/backend/tests/acceptance.suite.yml`
```yml
        - WebDriver:
            url: http://nginx:8081/
            host: browser
            port: 4444
            browser: chrome
```
`php-code/frontend/tests/acceptance.suite.yml`
```yml
        - WebDriver:
            url: http://nginx:8080/
            host: browser
            port: 4444
            browser: chrome
```
соответствующий путь будет передан в `c3_url` (последнюю настройку возможно установить напрямую)

### Общие настройки

Настройки `php-code/codeception.yml` дополняются слеюующим
```yml
coverage:
    enabled: true
```

Кроме уже обозначенных (а также ещё раз напоминая о remote_config)

**Обязательно** необходимы огранчения покрытия
**Обязательно** необходимы указания "удалённых" конфигов 

`php-code/backend/codeception.yml`
дополнятся следующим
```yml
coverage:
    # from nginx-conf-test/nginx.conf
    c3_url: http://nginx:8081/index-test.php
    # redefine `php-code/codeception.yml` for `c3.php`. Relative to `c3.php` dir:
    remote_config: backend/codeception.yml
    enabled: true
    include:
        - models/*
        - controllers/*
    exclude:
        - assets/*
        - config/*
        - runtime/*
        - views/*
        - web/*
        - tests/*
```

`php-code/frontend/codeception.yml`
дополнятся следующим
```yml
coverage:
    # from nginx-conf-test/nginx.conf
    c3_url: http://nginx:8080/index-test.php
    # redefine `php-code/codeception.yml` for `c3.php`. Relative to `c3.php` dir:
    remote_config: frontend/codeception.yml
    enabled: true
    include:
        - models/*
        - controllers/*
    exclude:
        - assets/*
        - config/*
        - runtime/*
        - views/*
        - web/*
        - tests/*
```

Запуск тестов с покрытием кода
```sh
codecept run --coverage --coverage-xml --coverage-html
```

Результаты покрытия кода можно посмотреть в папке логов. Оная, согласно настройкам
```yml
paths:
    log: console/runtime/logs
```

## Codeception и Docker-инструменты PHPStorm

Вдохновившись [заметкой про использоване PHPUnit](https://blog.jetbrains.com/phpstorm/2016/11/docker-remote-interpreters/)  
И написав про [тестирование для модулей yii2](https://github.com/bscheshirwork/yii2-cubs/blob/master/docs/tests.md)  
Решил проверить как обстоят дела с `Codeception` в данной IDE.

Делаем всё по аналогии: 

1. Создать интерпретатор на основании композиции докера, выбрав в настройках (File->Settings...)
`Languages & Frameworks`, главную ветку `PHP` (не раворачивая), на этой странице кликните кнопку […] после выпадающего списка `CLI interpreter`.
После чего нажмите зелёный плюс [+] и выбирать удалённый (From Docker, Vagrat, VM, Remote).
![default](https://user-images.githubusercontent.com/5769211/30068126-77120edc-9265-11e7-9c47-3f3e5bd165a8.png)  

На данной странице следует выберать `Docker-compose` и файл композиции для `Codeception` (не тот, что стоит по умолчанию)
`./docker-codeception-run/docker-compose.yml` - также используя меню [...] и сделав его единственной строчкой 
с помощью соответствующих инструментов [+][-]  
Сервис, который нас интересует, это `codecept`.
Примерное состояние настроек после применения перечисленного: 
![default](https://user-images.githubusercontent.com/5769211/30067959-0396fd50-9265-11e7-95e7-5b9f3478af74.png)  
После подтверждения всех изменений данного шага переходим к следующему.

2. Далее в опциях (File->Settings...) находим фреймворки тестирования `Languages & Frameworks`, `PHP` ветка `Test Frameworks`  
В ней добавляем `Codeception by remote interpreter`, используя кнопку зелёного плюса [+] и выпадающее меню.  
![default](https://user-images.githubusercontent.com/5769211/30068224-c56cd97c-9265-11e7-99e0-ebcbc6ce8bb8.png)  
Указываем тип, созданный в предыдущем пункте:
![default](https://user-images.githubusercontent.com/5769211/30068420-754b0012-9266-11e7-8306-5bc55059fcda.png)  
Важно! Указываем путь ВНУТРИ контейнера к тому месту, где находится исполнимый файл `codecept`. Для используемого образа
этот путь равен `/repo/codecept`. Убежаемся в этом, нажав кнопку со стрелочками после строки ввода.

Применяем изменения и возвращаемся в главное окно IDE.

3. Настройка запуска осуществляется через меню (Run->Edit configurations...)    
Вы можете добавить новую конфигурацию используя кнопку плюс [+] и выбрав `Codeception`.  
![default](https://user-images.githubusercontent.com/5769211/30068644-0df9537c-9267-11e7-8cb1-1f44cad625fc.png)  

В данном меню выберем необходимый нам файл конфигурации для запуска тестов - используя файл настроек. 
Выберем использование альтернативного файла конфигурации соответствующей галочкой и укажем путь к главному файлу настроек `Codeception`.
В данном меню выбор происходит относительно машины разработчика, не относительно контейнера. 

![default](https://user-images.githubusercontent.com/5769211/30068872-bf24d996-9267-11e7-8072-a76c1cb64ec1.png)  

Применяем изменения и возвращаемся в главное окно IDE.

4. Опционально: если приложение на шаблоне `yii2-advanced` не было запущено в `docker-compose`, неоходимо загрузить 
зависимости, инициализировать и настроить приложение как `Development`, [см.установку](install.md)  
`docker-compose -f docker-codeception-run/docker-compose.yml run --rm php composer update`  
`docker-compose -f docker-codeception-run/docker-compose.yml run --rm php ./init`

5. Запустить тесты с этого момента можно с помощью соответствующей кнопки с зелёным треугольником. Поздравляю!  
Вот только прибератся после этого придётся вручную - зависимости сервисов тянут и оставляют запущенные контейнеры.  
`docker-compose -f docker-codeception-run/docker-compose.yml down`
Отладку тестов, по прежнему, лучше использовать запуская из командной строки - карта не сделана на созданный `PHPstorm`ом 
контейнер. Останов первой строки происходит на скрипте `codeception.php`

6. Дополнительно можно создать отдельные конфигурации для запуска наборов тестов по отдельности, в 3м пункте выбрав
соответствующий файл для `frontend`: `php-code/frontend/codeception.yml`. Также строчой ниже, в опциях, можно указать
набор тестов, например `functional`.  
![default](https://user-images.githubusercontent.com/5769211/30154418-7fa1eba4-93c2-11e7-9ff6-f1259096741b.png)  
Для остальных вариантов настройки аналогичны.


### Отличия запуска в IDE от запуска в контейнере из командной строки

Внимание! В этом разделе указаны текущие проблемы тестирования и заплатка.

Всё отлично, казалось бы, и должно быть одинаково - но нет. Тесты, завершающиеся успехом при запуске контейнера `codecept` 
из командной строки
```
docker-compose -f docker-codeception-run/docker-compose.yml run --rm codecept run
...
Time: 1.59 minutes, Memory: 62.00MB

OK (26 tests, 127 assertions)
``` 
при запуске из `PHPStorm` в некоторых случаях провалиоись. Видимо, контейнер, создаваемый IDE изменён (например, в части пользователей)
Также, что интерестно, IDE показывает другое количество тестов, а именно: `344 tests done: 14 failed - 1m 12s 730ms` в
строке прогресса и
```
FAILURES!
Tests: 26, Assertions: 74, Failures: 14.
```
В выводе результатов.  
Все ошибки появились в наборах тестов `functional` 

Отличие проявляется в обработке `flash` сообщений виджета `Alert` - при запуске из IDE 
`Yii::$app->session->getAllFlashes()` возвращает пустой массив. Также нашлась причина
```
session_start(): Cannot send session cache limiter - headers already sent (output started at /repo/vendor/phpunit/phpunit/src/Util/Printer.php:110)
```

Для трассировки скопируем также содержимое рабочей папки образа-помощника `PHPStorm` и укажем в карте
```
phpstorm_helpers:PS-173.4127.29
```
Копируем, например, из запущеного контейнера, средствами `docker` 
```
rm ~/projects/.phpstorm_helpers/*
docker cp phpstorm_helpers_PS-173.4127.29:/opt/.phpstorm_helpers/ ~/projects/.phpstorm_helpers
```

Реультатом поиска и отладки стал неутешительный вывод - реализация `codeception.php` На данный момент сломана.

Переопределив в данном файле класс 
```php
...
/**
 * For avoid set headers before session start
 * Class PhpStorm_Codeception_ReportPrinter_Redefine
 */
class PhpStorm_Codeception_ReportPrinter_Redefine extends PHPUnit_TextUI_ResultPrinter
{
    /**
     * @inheritDoc
     */
    public function __construct(
        $out = null,
        $verbose = false,
        $colors = self::COLOR_DEFAULT,
        $debug = false,
        $numberOfColumns = 80,
        $reverse = false
    ) {
        parent::__construct(STDOUT, $verbose, $colors, $debug, $numberOfColumns, $reverse);
    }

    /**
     * Flush buffer and close output if it's not to a STDOUT stream
     */
    public function flush()
    {
        if ($this->out != STDOUT) {
            parent::flush();
        }
    }
}

class PhpStorm_Codeception_ReportPrinter extends PhpStorm_Codeception_ReportPrinter_Redefine
{
...
```

и удалив все старые контейнеры, которые могли закешировать его реализацию 
(я говорю о тебе, Reflection в Codeception), можно в папке `.phpstorm_helpers` запустить билд образа.
```
cd ~/projects/.phpstorm_helpers/
docker build --no-cache --pull -t phpstorm_helpers:PS-173.4127.29 .
```

Дальнейший запуск тестов пройдёт успешно. До следующего обновления.  
`531 tests done - 1m 18s 6900ms`  
```sh
Testing started at 12:56 ...
Codeception PHP Testing Framework v2.3.5
Powered by PHPUnit 5.7.21 by Sebastian Bergmann and contributors.


[common\tests]: tests from /var/www/html/common



[frontend\tests]: tests from /var/www/html//frontend



[backend\tests]: tests from /var/www/html/backend



Time: 1.57 minutes, Memory: 62.00MB

OK (26 tests, 127 assertions)

Process finished with exit code 0
```