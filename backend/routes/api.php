<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/health_check', function (){
    return response()->json([
        'status' => 'ok',
        'message' => 'Server is running'
    ]);
});
