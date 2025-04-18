<?php


namespace App\controllers;

use App\database\Database;
use App\models\BankUser;

class UserController
{
    /**
     * @throws \Exception
     */
    public static function getAllUsers()
    {
        // Create an instance of the BankUser model
        $userModel = new BankUser(Database::getInstance()->getConnection());

        // Fetch all users from the model
        $users = $userModel->getAll();

        // Return the result as JSON
        header('Content-Type: application/json'); // Set the content type to JSON
        echo json_encode($users); // Encode the result as JSON and echo it
    }


    public static function getUser($id)
    {
        // Logic to retrieve a single user by ID
        echo json_encode(["message" => "User with ID {$id}"]);
    }

    public static function createUser()
    {
        // Logic to create a new user
        echo json_encode(["message" => "User created successfully"]);
    }

    public static function updateUser($id)
    {
        // Logic to update a user's information
        echo json_encode(["message" => "User with ID {$id} updated"]);
    }

    public static function deleteUser($id)
    {
        // Logic to delete a user
        echo json_encode(["message" => "User with ID {$id} deleted"]);
    }
}
