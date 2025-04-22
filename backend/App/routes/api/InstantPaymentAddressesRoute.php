<?php

namespace App\routes\api;

use App\controllers\InstantPaymentAddressController;
use App\middleware\AuthMiddleware;

class InstantPaymentAddressesRoute {
    public static function define($router, array $middlewares = []) {

        $router->add('GET', '/api/ipa/by-ipa/{ipa_address}', [InstantPaymentAddressController::class, 'getByIpaAddress'], $middlewares);
        $router->add('GET', '/api/ipa/by-bank/{bank_id}', [InstantPaymentAddressController::class, 'getAllByBank'], $middlewares);
        $router->add('GET', '/api/ipa/by-user/{user_id}', [InstantPaymentAddressController::class, 'getAllByUserId'], $middlewares);
        $router->add('GET', '/api/ipa/by-id/{id}', [InstantPaymentAddressController::class, 'getByIpaId'], $middlewares);
        $router->add('DELETE', '/api/ipa/by-user/{user_id}', [InstantPaymentAddressController::class, 'deleteAllByUserId'], $middlewares);

        $router->add('GET', '/api/ipa', [InstantPaymentAddressController::class, 'getAllInstantPaymentAddresses'], $middlewares);
        $router->add('POST', '/api/ipa', [InstantPaymentAddressController::class, 'createInstantPaymentAddress'], $middlewares);

        $router->add('GET', '/api/ipa/{bank_id}/{account_number}', [InstantPaymentAddressController::class, 'getByBankAndAccount'], $middlewares);
        $router->add('PUT', '/api/ipa/{bank_id}/{account_number}', [InstantPaymentAddressController::class, 'updateInstantPaymentAddress'], $middlewares);
        $router->add('DELETE', '/api/ipa/{bank_id}/{account_number}', [InstantPaymentAddressController::class, 'deleteInstantPaymentAddress'], $middlewares);

     
        $router->add('PUT', '/api/ipa/update-pin', [InstantPaymentAddressController::class, 'updatePinForIpa'], $middlewares);
        $router->add('POST', '/api/ipa/verify-pin', [InstantPaymentAddressController::class, 'verifyPinForIpa'], $middlewares);
    }
}
