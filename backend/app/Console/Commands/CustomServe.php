<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;

class CustomServe extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'custom:serve';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Custom serve command for starting the Laravel server with specific parameters.';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle()
    {
        $this->info('Starting Laravel server with custom parameters...');

        // Get the local machine IP address (IPv4)
        $localIp = getHostByName(getHostName());

        // Set custom parameters for the Laravel server
        $host = '0.0.0.0'; // Wildcard address
        $port = '2501';

        // Display the actual IP address and port
        $this->info("Server running on http://localhost:{$port}");
        $this->info("Server running on http://{$localIp}:{$port}");

        // Call the 'serve' command with your custom parameters
        $this->call('serve', [
            '--host' => $host,
            '--port' => $port,
        ]);
    }
}
