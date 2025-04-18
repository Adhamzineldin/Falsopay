<?php

namespace App\routes;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, callable $handler, array $middlewares = []): void
    {
        $this->routes[strtoupper($method)][] = [
            'path'        => $path,
            'handler'     => $handler,
            'middlewares' => $middlewares
        ];
    }

    public function handleRequest(): void
    {
        $uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'];

        if (!isset($this->routes[$method])) {
            $this->sendNotFound();
            return;
        }

        foreach ($this->routes[$method] as $route) {
            $pattern = $this->convertRouteToRegex($route['path']);
            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches); // drop full match
                // run middleware
                foreach ($route['middlewares'] as $mw) {
                    call_user_func($mw);
                }
                // call handler with dynamic params
                call_user_func_array($route['handler'], $matches);
                return;
            }
        }

        $this->sendNotFound();
    }

    private function sendNotFound(): void
    {
        http_response_code(404);
        echo file_get_contents(__DIR__ . '/../../public/404.html');
    }

    private function convertRouteToRegex(string $path): string
    {
        $segments = explode('/', trim($path, '/'));
        $regexParts = [];

        foreach ($segments as $seg) {
            if (preg_match('/^\{[A-Za-z0-9_]+\}$/', $seg)) {
                // dynamic segment
                $regexParts[] = '([^/]+)';
            } else {
                // static segment: escape for regex
                $regexParts[] = preg_quote($seg, '#');
            }
        }

        $regex = '#^/' . implode('/', $regexParts) . '$#';
        return $regex;
    }
}
