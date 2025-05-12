<?php

namespace App\core;

class CodeMetricsAnalyzer {
    private $basePath;
    private $metrics = [];

    public function __construct($basePath) {
        $this->basePath = $basePath;
    }

    public function analyze() {
        $this->scanDirectory($this->basePath);
        return $this->metrics;
    }

    private function scanDirectory($dir) {
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->scanDirectory($path);
            } else if (pathinfo($path, PATHINFO_EXTENSION) === 'php') {
                $this->analyzeFile($path);
            }
        }
    }

    private function analyzeFile($file) {
        $content = file_get_contents($file);
        $className = $this->getClassName($content);
        if (!$className) return;

        $this->metrics[$className] = [
            'CCM' => $this->calculateCCM($content),
            'WMC' => $this->calculateWMC($content),
            'DIT' => $this->calculateDIT($content),
            'NOC' => $this->calculateNOC($content),
            'CBO' => $this->calculateCBO($content),
            'RFC' => $this->calculateRFC($content),
            'LCOM' => $this->calculateLCOM($content)
        ];
    }

    private function getClassName($content) {
        if (preg_match('/class\s+(\w+)/', $content, $matches)) {
            return $matches[1];
        }
        return null;
    }

    private function calculateCCM($content) {
        // Count decision points
        $decisionPoints = [
            'if\s*\(',
            'else\s*if\s*\(',
            'else\s*:',
            'case\s+',
            'catch\s*\(',
            'while\s*\(',
            'for\s*\(',
            'foreach\s*\(',
            '\?\s*[^:]+:',
            '&&',
            '\|\|'
        ];

        $ccm = 1; // Base complexity
        foreach ($decisionPoints as $pattern) {
            $count = preg_match_all('/' . $pattern . '/', $content);
            $ccm += $count;
        }

        return $ccm;
    }

    private function calculateWMC($content) {
        // Count methods and their complexity
        $methods = $this->getMethods($content);
        $wmc = 0;

        foreach ($methods as $method) {
            $wmc += $this->calculateCCM($method);
        }

        return $wmc;
    }

    private function calculateDIT($content) {
        // Count inheritance depth
        $dit = 0;
        if (preg_match('/extends\s+(\w+)/', $content, $matches)) {
            $parentClass = $matches[1];
            $parentFile = $this->findClassFile($parentClass);
            if ($parentFile) {
                $parentContent = file_get_contents($parentFile);
                $dit = 1 + $this->calculateDIT($parentContent);
            }
        }
        return $dit;
    }

    private function calculateNOC($content) {
        // Count number of child classes
        $className = $this->getClassName($content);
        $noc = 0;

        foreach ($this->metrics as $class => $metrics) {
            if (preg_match('/extends\s+' . $className . '/', $content)) {
                $noc++;
            }
        }

        return $noc;
    }

    private function calculateCBO($content) {
        // Count class couplings
        $cbo = 0;
        $patterns = [
            'use\s+([^;]+);',
            'new\s+(\w+)',
            'extends\s+(\w+)',
            'implements\s+(\w+)'
        ];

        foreach ($patterns as $pattern) {
            $cbo += preg_match_all('/' . $pattern . '/', $content);
        }

        return $cbo;
    }

    private function calculateRFC($content) {
        // Count method calls and method definitions
        $methods = $this->getMethods($content);
        $rfc = count($methods);

        foreach ($methods as $method) {
            $rfc += preg_match_all('/->\w+\s*\(/', $method);
        }

        return $rfc;
    }

    private function calculateLCOM($content) {
        // Calculate Lack of Cohesion in Methods
        $methods = $this->getMethods($content);
        $instanceVars = $this->getInstanceVariables($content);
        
        if (empty($methods) || empty($instanceVars)) {
            return 0;
        }

        $pairs = 0;
        $sharedPairs = 0;

        for ($i = 0; $i < count($methods); $i++) {
            for ($j = $i + 1; $j < count($methods); $j++) {
                $pairs++;
                if ($this->shareInstanceVars($methods[$i], $methods[$j], $instanceVars)) {
                    $sharedPairs++;
                }
            }
        }

        return $pairs - $sharedPairs;
    }

    private function getMethods($content) {
        preg_match_all('/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/s', $content, $matches);
        return $matches[0] ?? [];
    }

    private function getInstanceVariables($content) {
        preg_match_all('/private\s+\$\w+|protected\s+\$\w+|public\s+\$\w+/', $content, $matches);
        return $matches[0] ?? [];
    }

    private function shareInstanceVars($method1, $method2, $instanceVars) {
        foreach ($instanceVars as $var) {
            if (strpos($method1, $var) !== false && strpos($method2, $var) !== false) {
                return true;
            }
        }
        return false;
    }

    private function findClassFile($className) {
        // Implement logic to find class file
        // This is a simplified version
        $files = glob($this->basePath . '/**/*.php');
        foreach ($files as $file) {
            $content = file_get_contents($file);
            if (preg_match('/class\s+' . $className . '/', $content)) {
                return $file;
            }
        }
        return null;
    }
} 