<?php

namespace core;


class Router
{
    private array $routes = [];

    public function add(string $method, string $path, $handler, array $middlewares = []): void
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
                $request = [];
                foreach ($route['middlewares'] as $mw) {
                    // Check if middleware is an object with a process method
                    if (is_object($mw) && method_exists($mw, 'process')) {
                        $result = $mw->process($request);
                        if ($result === false) {
                            $this->sendUnauthorized();
                            return;
                        }
                        // Update request with middleware result if it's an array
                        if (is_array($result)) {
                            $request = $result;
                        }
                    } 
                    // Check if middleware is a callable
                    else if (is_callable($mw)) {
                        if (!call_user_func($mw)) {
                            $this->sendUnauthorized();
                            return;
                        }
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

                // Handle controller class methods
                $handler = $route['handler'];
                if (is_array($handler) && count($handler) == 2 && is_string($handler[0]) && is_string($handler[1])) {
                    $className = $handler[0];
                    $methodName = $handler[1];
                    
                    // Instantiate the class
                    $instance = new $className();
                    
                    // Call the method on the instance and get the response
                    $response = $instance->$methodName(...$matches);
                    
                    // Process the response
                    $this->handleResponse($response);
                } else {
                    // For other types of handlers (closures, etc.), use call_user_func_array
                    $response = call_user_func_array($handler, $matches);
                    
                    // Process the response
                    $this->handleResponse($response);
                }
                
                return;
            }
        }

        $this->sendNotFound();
    }

    /**
     * Handle different types of responses
     * 
     * @param mixed $response The response from the controller
     */
    private function handleResponse($response): void
    {
        // If the response is an array, convert it to JSON and set the appropriate headers
        if (is_array($response)) {
            // Set response code if provided
            if (isset($response['code'])) {
                http_response_code($response['code']);
                unset($response['code']); // Remove code from response data
            } else {
                http_response_code(200); // Default to 200 OK
            }
            
            // Set Content-Type header for JSON
            header('Content-Type: application/json');
            
            // Output JSON response
            echo json_encode($response);
        } 
        // If it's a string, it might be already formatted JSON or plain text
        else if (is_string($response)) {
            // Check if it looks like JSON
            $firstChar = substr(trim($response), 0, 1);
            if ($firstChar === '{' || $firstChar === '[') {
                header('Content-Type: application/json');
            }
            
            echo $response;
        }
        // For other types or null (void), do nothing
    }

    private function sendNotFound(): void
    {
        http_response_code(404);
        header('Content-Type: text/html');
        readfile(__DIR__ . '/../public/404.html');
    }

    private function sendUnauthorized(): void
    {
        http_response_code(401);
        header('Content-Type: text/html');
        readfile(__DIR__ . '/../public/401.html');
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
