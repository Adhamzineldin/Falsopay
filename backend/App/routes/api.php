<?php
// This file is legacy and has been replaced by individual route files

// Public Support route - doesn't require authentication
$router->post('/public/support', 'SupportController@createPublicTicket'); 