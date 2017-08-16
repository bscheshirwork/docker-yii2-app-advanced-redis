# Очереди

Используется [yiisoft/yii2-queue](https://github.com/yiisoft/yii2-queue) в связке с [redis](https://hub.docker.com/_/redis/) через [yiisoft/yii2-redis](https://github.com/yiisoft/yii2-redis)

Конфиг очередей размещён в основном конфиге общей части приложений, 
`php-code/common/config/main.php`
```
return [
    //....
    'components' => [
        'redis' => [
            'class' => 'yii\redis\Connection',
            //....
        ],
        'queue' => [
            'class' => \yii\queue\redis\Queue::class,
            'redis' => 'redis', // Компонент подключения к Redis или его конфиг
            'channel' => 'queue', // Ключ канала очереди
        ],
    ],
];
```

автозагрузка консольных команд - соответственно в основном конфиге консольного приложения.
`php-code/console/config/main.php`
```
return [
    //....
    'bootstrap' => [
        'log',
        'queue', // Компонент регистрирует свои консольные команды
    ],
];
```
впрочем, встроена проверка `if ($app instanceof ConsoleApp)...`, поэтому можно размещать в основном конфиге общей части.

Настройка и использование последних освещены в [about-redis](./about-redis.md)

Документация о очередях доступна в [руководстве](https://github.com/yiisoft/yii2-queue/blob/master/docs/guide-ru/README.md)

Постановка заданий в очередь возможна от любого приложения, обработка происходит в специально сконфигурированном отдельном 
контейнере, консольными командами. Соответственно, большая часть настроек приходится на конфиг консольного, соответственно, приложения.

В простейшем случае воркеры обрабатывают задания, представленные в этом же проекте.  
Например, `php-code/common/components/queue/DownloadJob.php`
```
<?php

namespace components\queue;

use yii\base\Object;

class DownloadJob extends Object implements \yii\queue\Job
{
    public $url;
    public $file;

    public function execute($queue)
    {
        file_put_contents($this->file, file_get_contents($this->url));
    }
}
```
будет сохранять загрузки в пределах контейнера `run_php-supervisor_1` (при запуске композиции из `docker-run/docker-compose.yml`)

Управление запуском воркеров происходит с помощью [supervisor](./about-supervisor.md) в контейнере на основе 
`bscheshirwork/yii2-alpine-supervisor[-xdebug]`

> Note: Компонент [yiisoft/yii2-queue](https://github.com/yiisoft/yii2-queue) предостваляет инструмент для создания заданий в gii

Посмотреть статистику по работе очереди можно с помощью консольной команды `queue/info` из контейнера `php` либо `php-supervisor`
```
docker-compose -f /home/dev/projects/docker-yii2-app-advanced-redis/docker-run/docker-compose.yml exec php-supervisor ./yii queue/info
```