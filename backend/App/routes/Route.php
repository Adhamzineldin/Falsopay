<?php

namespace App\routes;

abstract class Route
{
    abstract public static function define($router, array $middlewares = []): void;
}