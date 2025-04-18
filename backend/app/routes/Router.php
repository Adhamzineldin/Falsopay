<?php

namespace App\routes;
class Router {
    private array $routes = [];
    
    
    // Add a route (with optional middleware for specific routes)
    public function add(string $method, string $path, callable $handler, array $middlewares = []): void {
        $this->routes[strtoupper($method)][] = [
            'path' => $path,
            'handler' => $handler,  
            'middlewares' => $middlewares
        ];
    }

    // Handle the incoming request
    public function handleRequest(): void {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'];
        
        if (isset($this->routes[$method])) {
            foreach ($this->routes[$method] as $route) {
                if ($route['path'] === $uri) {
                    // Execute middleware for the specific route
                    foreach ($route['middlewares'] as $middleware) {
                        call_user_func($middleware);
                    }

                    // Execute the route handler
                    call_user_func($route['handler']);
                    return;
                }
            }
        }

        // If no route matched
        http_response_code(404);
        echo file_get_contents(__DIR__ . '/../../public/404.html');
    }
}
