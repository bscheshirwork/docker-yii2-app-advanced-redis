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
phpstorm_helpers:PS-172.4155.41
```
Копируем, например, из запущеного контейнера, средствами `docker` 
```
docker cp phpstorm_helpers_PS-172.4155.41:/opt/.phpstorm_helpers/ .phpstorm_helpers
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
docker build -t phpstorm_helpers:PS-172.4155.41 .
```

Дальнейший запуск тестов пройдёт успешно. До следующего обновления.  
`531 tests done - 1m 18s 6900ms`  
```sh
Testing started at 12:56 ...
Codeception PHP Testing Framework v2.3.5
Powered by PHPUnit 5.7.21 by Sebastian Bergmann and contributors.


[common\tests]: tests from /project/common



[frontend\tests]: tests from /project/frontend



[backend\tests]: tests from /project/backend



Time: 1.57 minutes, Memory: 62.00MB

OK (26 tests, 127 assertions)

Process finished with exit code 0
```