<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',  // Point to api.php for API routes
        commands: __DIR__.'/../routes/console.php',  // Keep console routes the same
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Add API-specific middleware here if needed
        // Laravel automatically adds the 'api' middleware group for API routes
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle any custom exceptions you might need
    })
    ->create();
