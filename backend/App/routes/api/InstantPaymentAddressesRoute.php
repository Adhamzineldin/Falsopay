<?php

namespace App\routes\api;

use App\controllers\InstantPaymentAddressController;
use App\middleware\AuthMiddleware;

class InstantPaymentAddressesRoute {
    public static function define($router, array $middlewares = []) {
        
        $router->add('GET', '/api/ipa/by-ipa/{ipa_address}', [InstantPaymentAddressController::class, 'getByIpaAddress']);
        $router->add('GET', '/api/ipa/by-bank/{bank_id}', [InstantPaymentAddressController::class, 'getAllByBank']);
        $router->add('GET', '/api/ipa/by-user/{user_id}', [InstantPaymentAddressController::class, 'getAllByUserId']);
        $router->add('GET', '/api/ipa/by-id/{id}', [InstantPaymentAddressController::class, 'getByIpaId']);
        $router->add('DELETE', '/api/ipa/by-user/{user_id}', [InstantPaymentAddressController::class, 'deleteAllByUserId']);
        
        $router->add('GET', '/api/ipa', [InstantPaymentAddressController::class, 'getAllInstantPaymentAddresses']);
        $router->add('POST', '/api/ipa', [InstantPaymentAddressController::class, 'createInstantPaymentAddress']);
        
        $router->add('GET', '/api/ipa/{bank_id}/{account_number}', [InstantPaymentAddressController::class, 'getByBankAndAccount']);
        $router->add('PUT', '/api/ipa/{bank_id}/{account_number}', [InstantPaymentAddressController::class, 'updateInstantPaymentAddress']);
        $router->add('DELETE', '/api/ipa/{bank_id}/{account_number}', [InstantPaymentAddressController::class, 'deleteInstantPaymentAddress']);
    }
}
