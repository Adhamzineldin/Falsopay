<?php

namespace App\database\seeders;


class DatabaseSeeder {
    public static function run() {
        BankSeeder::run();
        BankUserSeeder::run();
        BankAccountSeeder::run();
        InstantPaymentAddressSeeder::run();
        UserSeeder::run();
        CardSeeder::run();
        TransactionSeeder::run();
    }
}