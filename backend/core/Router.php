<?php

namespace core;


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
                    if (!call_user_func($mw)) {
                        $this->sendUnauthorized();
                        return;
                    }
                }


                // --- BODY PARSING ---
                $body = null;
                if (in_array($method, ['POST','PUT','PATCH'], true)) {
                    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
                    // JSON?
                    if (stripos($contentType, 'application/json') !== false) {
                        $raw = file_get_contents('php://input');
                        $parsed = json_decode($raw, true);
                        $body = is_array($parsed) ? $parsed : [];
                    }
                    // Form data?
                    else {
                        $body = $_POST;
                    }
                }

                // always pass the body (even if empty array) as the last parameter
                $matches[] = $body;

                // call handler with URL params + body
                call_user_func_array($route['handler'], $matches);
                return;
            }
        }

        $this->sendNotFound();
    }

    private function sendNotFound(): void
    {
        http_response_code(404);
        echo file_get_contents(__DIR__ . '/../public/404.html');
    }

    private function sendUnauthorized(): void
    {
        http_response_code(401);
        echo file_get_contents(__DIR__ . '/../public/401.html');
    }

    private function convertRouteToRegex(string $path): string
    {
        $segments   = explode('/', trim($path, '/'));
        $regexParts = [];

        foreach ($segments as $seg) {
            if (preg_match('/^\{[A-Za-z0-9_]+\}$/', $seg)) {
                // dynamic segment → capture anything but slash
                $regexParts[] = '([^/]+)';
            } else {
                // static segment → escape for regex
                $regexParts[] = preg_quote($seg, '#');
            }
        }

        return '#^/' . implode('/', $regexParts) . '$#';
    }
}
