<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Setup method that runs before each test
     */
    protected function setUp(): void
    {
        parent::setUp();
        // Add common setup code here
    }

    /**
     * Teardown method that runs after each test
     */
    protected function tearDown(): void
    {
        // Add common teardown code here
        parent::tearDown();
    }
} 