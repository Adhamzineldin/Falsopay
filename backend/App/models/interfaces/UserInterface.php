<?php

namespace App\models\interfaces;

interface UserInterface
{
    /**
     * @return int|null The user's ID
     */
    public function getUserId(): ?int;

    /**
     * @return string The user's first name
     */
    public function getFirstName(): string;

    /**
     * @return string The user's last name
     */
    public function getLastName(): string;

    /**
     * @return string The user's email address
     */
    public function getEmail(): string;

    /**
     * @return string The user's phone number
     */
    public function getPhoneNumber(): string;

    /**
     * @return string The user's creation timestamp
     */
    public function getCreatedAt(): string;

    /**
     * @return int|null The user's default account ID
     */
    public function getDefaultAccount(): ?int;

    /**
     * @return string The user's role (user or admin)
     */
    public function getRole(): string;

    /**
     * @return string The user's status (active or blocked)
     */
    public function getStatus(): string;

    /**
     * Set the user's first name
     * @param string $firstName
     * @return void
     */
    public function setFirstName(string $firstName): void;

    /**
     * Set the user's last name
     * @param string $lastName
     * @return void
     */
    public function setLastName(string $lastName): void;

    /**
     * Set the user's email address
     * @param string $email
     * @return void
     */
    public function setEmail(string $email): void;

    /**
     * Set the user's phone number
     * @param string $phoneNumber
     * @return void
     */
    public function setPhoneNumber(string $phoneNumber): void;

    /**
     * Set the user's default account ID
     * @param int|null $defaultAccount
     * @return void
     */
    public function setDefaultAccount(?int $defaultAccount): void;

    /**
     * Set the user's role
     * @param string $role
     * @return void
     */
    public function setRole(string $role): void;

    /**
     * Set the user's status
     * @param string $status
     * @return void
     */
    public function setStatus(string $status): void;
} 