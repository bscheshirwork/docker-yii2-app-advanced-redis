Модули
==============

В данной главе описаны подключённые модули, их настройки, предназначение и особенности.

Информация <span id="start-modules-info"></span>
-----------------------

Компонент приложения | Отвечает за | Представлен модулем (имя класса, alias для настроек)
--- | --- | --- | ---
[user](#user) | управление пользователями | dektrium\user\Module
[rbac](#rbac) | графическое представление RBAC | githubjeka\rbac\Module
[admin](#admin) | управление RBAC | mdm\admin\Module


user <span id="start-modules-user"></span>
-----------------------

Отвечает за работу с пользователями.
Администрирование, аутентификация, регистрация, восстановление паролей, изменение своих данных.

Пути модуля, согласно документации:
```
- **/user/registration/register** Displays registration form
- **/user/registration/resend**   Displays resend form
- **/user/registration/confirm**  Confirms a user (requires *id* and *token* query params)
- **/user/security/login**        Displays login form
- **/user/security/logout**       Logs the user out (available only via POST method)
- **/user/recovery/request**      Displays recovery request form
- **/user/recovery/reset**        Displays password reset form (requires *id* and *token* query params)
- **/user/settings/profile**      Displays profile settings form
- **/user/settings/account**      Displays account settings form (email, username, password)
- **/user/settings/networks**     Displays social network accounts settings page
- **/user/profile/show**          Displays user's profile (requires *id* query param)
- **/user/admin/index**           Displays user management interface
```

Доступны следующие правила разрешения url (в формате urlRule)
```
'<id:\d+>'                               => 'profile/show',
'<action:(login|logout)>'                => 'security/<action>',
'<action:(register|resend)>'             => 'registration/<action>',
'confirm/<id:\d+>/<code:[A-Za-z0-9_-]+>' => 'registration/confirm',
'forgot'                                 => 'recovery/request',
'recover/<id:\d+>/<code:[A-Za-z0-9_-]+>' => 'recovery/reset',
'settings/<action:\w+>'                  => 'settings/<action>'
```

Конфигурация yii2-advanced-rbac/common/config/main.php

```php
    'modules' => [
        'user' => [
            'class' => 'dektrium\user\Module',
        ],
    ],
```

Запрет доступа к профилю, восстановлению пароля, регистрации и настройкам своего аккаунта из бекенда: в
`yii2-advanced-rbac/backend/config/main.php` добавить:

```php
    'modules' => [
        'user' => [
            // Отключить контроллеры profile, recovery, registration, settings. Остались security, admin
            'as backend' => 'dektrium\user\filters\BackendFilter',
        ],
    ],
```

Запрет администрирования с фронтенда: в `yii2-advanced-rbac/frontend/config/main.php` добавить:

```php
    'modules' => [
        'user' => [
            // Отключить контроллер admin. Остались profile, recovery, registration, security, settings.
            'as frontend' => 'dektrium\user\filters\FrontendFilter',
        ],
    ],
```


Источник: `[yii2-user](https://github.com/dektrium/yii2-user)`

rbac <span id="start-modules-rbac"></span>
-----------------------

Отвечает за графическое представление RBAC. По умолчанию доступен по адресу
`index.php?r=rbac`

Конфигурация backend
В примере указан стандартный фильтр доступа к модулю

```php
'modules' => [
    'rbac' => [
        'class' => 'githubjeka\rbac\Module',
        'as access' => [ // if you need to set access
            'class' => 'yii\filters\AccessControl',
            'rules' => [
                [
                    'allow' => true,
                    'roles' => ['@'] // all auth users
                ],
            ]
        ]
    ],
],
```

Источник: `[gui-rbac-yii2](https://github.com/githubjeka/gui-rbac-yii2)`

admin <span id="start-modules-admin"></span>
-----------------------

Отвечает за управление RBAC. Пути для управления из официальной документации:

```
http://localhost/path/to/index.php?r=admin
http://localhost/path/to/index.php?r=admin/route
http://localhost/path/to/index.php?r=admin/permission
http://localhost/path/to/index.php?r=admin/menu
http://localhost/path/to/index.php?r=admin/role
http://localhost/path/to/index.php?r=admin/assignment
```

Конфигурация `@backend/config/main.php`
```php
    'modules' => [
        'admin' => [
            'class' => 'mdm\admin\Module',
            'controllerNamespace' => 'mdm\admin\controllers',// пространство имён контроллеров
        ],
    ],
```

Во время разработки может понадобится отключить проверку прав для некоторых путей.
Этого можно достигнуть следующим конфигом (фильтр добавлен глобально):

```php
'modules' => [...],
...
//фильтр для приложения
'as access' => [
    'class' => 'mdm\admin\components\AccessControl',
    'allowActions' => [
        'site/*',
        'admin/*',
        'some-controller/some-action',
        // The actions listed here will be allowed to everyone including guests.
        // So, 'admin/*' should not appear here in the production, of course.
        // But in the earlier stages of your development, you may probably want to
        // add a lot of actions here until you finally completed setting up rbac,
        // otherwise you may not even take a first step.
    ]
],

```

Источник: `[yii2-admin](https://github.com/mdmsoft/yii2-admin)`
