<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use App\core\CodeMetricsAnalyzer;

$analyzer = new CodeMetricsAnalyzer(__DIR__ . '/..');
$metrics = $analyzer->analyze();

// Output results in a formatted way
echo "Code Metrics Analysis Results:\n";
echo "=============================\n\n";

foreach ($metrics as $className => $classMetrics) {
    echo "Class: $className\n";
    echo "------------------------\n";
    echo "Cyclomatic Complexity (CCM): {$classMetrics['CCM']}\n";
    echo "Weighted Methods per Class (WMC): {$classMetrics['WMC']}\n";
    echo "Depth of Inheritance (DIT): {$classMetrics['DIT']}\n";
    echo "Number of Children (NOC): {$classMetrics['NOC']}\n";
    echo "Coupling Between Objects (CBO): {$classMetrics['CBO']}\n";
    echo "Response for Class (RFC): {$classMetrics['RFC']}\n";
    echo "Lack of Cohesion (LCOM): {$classMetrics['LCOM']}\n";
    echo "\n";
}

// Calculate averages
$averages = [
    'CCM' => 0,
    'WMC' => 0,
    'DIT' => 0,
    'NOC' => 0,
    'CBO' => 0,
    'RFC' => 0,
    'LCOM' => 0
];

$classCount = count($metrics);
foreach ($metrics as $classMetrics) {
    foreach ($averages as $metric => $value) {
        $averages[$metric] += $classMetrics[$metric];
    }
}

echo "Average Metrics:\n";
echo "---------------\n";
foreach ($averages as $metric => $value) {
    $average = $classCount > 0 ? $value / $classCount : 0;
    echo "$metric: " . number_format($average, 2) . "\n";
} 