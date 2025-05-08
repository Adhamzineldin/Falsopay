# FalsoPay Backend Tests

This directory contains tests for the FalsoPay backend application.

## Test Structure

- `Unit/`: Unit tests for individual components
  - `Models/`: Tests for data models
  - `Controllers/`: Tests for controllers
  - `Services/`: Tests for services

## Running Tests

To run all tests:

```bash
composer test
```

To run only unit tests:

```bash
composer test:unit
```

## Writing Tests

### Unit Tests

Unit tests should test individual components in isolation. Use Mockery to mock dependencies.

Example:

```php
<?php

namespace Tests\Unit\Models;

use App\models\User;
use Tests\Unit\TestCase;
use Mockery;

class UserTest extends TestCase
{
    public function testGetUserById()
    {
        // Test implementation
    }
}
```

### Test Conventions

1. Test methods should start with `test`
2. Test methods should describe what they're testing
3. Use assertions to verify expected behavior
4. Clean up resources in `tearDown()`

## Mocking

The tests use Mockery for mocking dependencies. Example:

```php
$userMock = Mockery::mock('overload:App\models\User');
$userMock->shouldReceive('getUserById')
    ->once()
    ->with(1)
    ->andReturn(['id' => 1, 'name' => 'Test User']);
```

## Assertions

Use PHPUnit assertions to verify expected behavior:

- `assertEquals($expected, $actual)`: Assert that two values are equal
- `assertTrue($condition)`: Assert that a condition is true
- `assertFalse($condition)`: Assert that a condition is false
- `assertNull($value)`: Assert that a value is null
- `assertNotNull($value)`: Assert that a value is not null 