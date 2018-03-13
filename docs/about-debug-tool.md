# Консоль yii2, доступ gii, тесты и docker


При запуске композиции и инициализации для разработки (`init 0`) с настройкой демона докера `--userland-proxy = true` 
придётся добавить в локальные конфиги разрешения на доступ к инструментам разработки, учитывая тот факт, 
что запросы будут из шлюза сети композиции, к примеру
```
        "Name": "dockerrun_default",
        "Scope": "local",
        "Driver": "bridge",
        "IPAM": {
            "Driver": "default",
            "Config": [
                {
                    "Subnet": "172.19.0.0/16",
                    "Gateway": "172.19.0.1"
                }
            ]
        },

``` 
[Docker binding](https://docs.docker.com/engine/userguide/networking/default_network/binding/)  
[how to get real remote client ip](https://github.com/moby/moby/issues/15086)

Настройки доступа по IP, соответственно, ослаблены

`php-code/frontend/config/main-local.php`, `php-code/backend/config/main-local.php`
```php
if (!YII_ENV_TEST) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
        'allowedIPs' => ['172.*'],
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
        'allowedIPs' => ['172.*'],
    ];
}
```

Дополнительно необходимо и крайне желательно установить какие-либо фильтры ограничения доступа, наподобие пароля для gii.

Важно следить за разграничением разработки, тестов и продакшена.


## selenium 
Для доступа к приёмочным тестам из сервиса selenium необходимо изменить фильтры в точках входа тестов:
`php-code/frontend/web/index-test.php` `php-code/backend/web/index-test.php`
Доступ бует требоватся от сервиса в той же сети, не от шлюза
```php
//check if not in same subnet /16 (255.255.0.0)
if ((ip2long(@$_SERVER['REMOTE_ADDR']) ^ ip2long(@$_SERVER['SERVER_ADDR'])) >= 2 ** 16) {
    die('You are not allowed to access this file.');
}
```