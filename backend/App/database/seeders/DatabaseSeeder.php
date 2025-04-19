<?php

namespace App\database\seeders;


class DatabaseSeeder {
    public static function run() {
        BankSeeder::run();
        BankUserSeeder::run();
        BankAccountSeeder::run();
        UserSeeder::run();
        InstantPaymentAddressSeeder::run();
        CardSeeder::run();
        TransactionSeeder::run();
    }
}