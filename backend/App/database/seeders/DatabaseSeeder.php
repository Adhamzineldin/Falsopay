<?php

namespace App\database\seeders;


class DatabaseSeeder {
    public static function run() {
        // Order is important for foreign key constraints
        BankSeeder::run();
        BankUserSeeder::run();
        UserSeeder::run();
        BankAccountSeeder::run();
        CardSeeder::run();
        InstantPaymentAddressSeeder::run();
        DefaultIpaAccountSeeder::run();
        TransactionSeeder::run();
    }
}